import { AfterViewInit, Component, ElementRef, ViewChild, isDevMode } from '@angular/core';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { NodeItem, EdgeItem, CoOrdinates } from '../interface/network';
import * as shortUUID from 'short-uuid';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements AfterViewInit {

  @ViewChild('network') el!: ElementRef;
  networkInstance: any;
  NODES = new DataSet<NodeItem>([]);
  EDGES = new DataSet<EdgeItem>([]);
  color =  {
    border: 'hsl(198, 100%, 24%)',
    background: 'hsl(198, 66%, 57%)',
    highlight: {
      border: 'hsl(198, 100%, 24%)',
      background: 'hsl(198, 69%, 69%)'
    }
  }
  devMode: boolean = isDevMode();

  ngAfterViewInit() {
     const container = this.el.nativeElement;

     this.NODES = new DataSet<NodeItem>([
      {
        id: "1",
        label: "start",
        final: false,
        x: -184,
        y: -41
      },
      {
        id: "2",
        label: "Node 1",
        final: true,
        x: 11,
        y: -40
      }
    ]);

    this.EDGES = new DataSet<EdgeItem>([
      {
        id: "1",
        from: "1",
        to: "2",
        label: "1",
        smooth: { type: "curvedCW", roundness: 0.2 }
      },
      { id: "2", from: "1", to: "1", label: "0" },
      {
        id: "3",
        from: "2",
        to: "1",
        label: "1, 2",
        smooth: { type: "curvedCW", roundness: 0.2 }
      }
    ]);

    const data = { nodes: this.NODES, edges: this.EDGES  }

    const OPTIONS = {
      nodes: {
        shape: "circle",
        color: this.color,
        heightConstraint: {
          minimum: 50
        },
        widthConstraint: {
          minimum: 50,
          maximum: 50
        }
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 1, type: "arrow" }
        },
        // by default all edges property should be this
        // smooth: { type: "curvedCW", roundness: 0.5 }
        smooth: {      enabled: true,
          type: "continuous",
          roundness: 0.0}
      },
      physics: {
        enabled: false 
      },
      interaction: {
        selectConnectedEdges: false
      }
    };

    this.networkInstance = new Network(container, data, OPTIONS);

    this.networkInstance.on("selectNode", this.handleSelectedNodeEvent)

    this.networkInstance.on("doubleClick", this.handleDoubleClickEvent.bind(this))

  }

  private handleSelectedNodeEvent(params: any) {
    console.log("handleSelectedNodeEvent");
    console.log(params);
  }

  private handleDoubleClickEvent(params: any) {
    console.log("handleDoubleClickEvent");
    console.log(params);

    const {
      pointer: {
        canvas: { x, y }
      },
      nodes,
      edges
    } = params;

    if(nodes[0]) {
      // double clicked on a existing node, toggle the final property
      this.updateNode(nodes[0]);
    } else if(!edges[0]) {
      // clicked on empty canvas so create a new node
      var coOrdinates: CoOrdinates = {x, y};
      this.createNewNode(coOrdinates);
    }
  }

  updateNode(nodeId: string) {
    this.toggleNodeFinal(nodeId);
  }

  toggleNodeFinal(nodeId: string) {
    var node = this.NODES.get(nodeId);
    var coOrds: CoOrdinates = this.networkInstance.getPosition(nodeId);
    if(node) {
      node.final = !node.final
      node.x = coOrds.x
      node.y = coOrds.y
      this.NODES.update(node)
    }
  }

  createNewNode(coOrdinates: CoOrdinates) {
    console.log("createNewNode");
    var node: NodeItem = {
      id: shortUUID.generate(),
      final: false,
      label: "node label",
      x: coOrdinates.x,
      y: coOrdinates.y
    };

    this.NODES.update(node)
  }

  getAllNodeDetails() {
    console.log(this.networkInstance.getPositions(this.NODES.getIds()))
  }

}
