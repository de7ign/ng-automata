import { AfterViewInit, Component, ElementRef, ViewChild, isDevMode } from '@angular/core';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { NodeItem, EdgeItem, CoOrdinates } from '../interface/network';
import * as shortUUID from 'short-uuid';
import keycharm from 'keycharm';

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
        id: "start",
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
        from: "start",
        to: "2",
        label: "1",
        smooth: { type: "curvedCW", roundness: 0.2 }
      },
      { id: "2", from: "start", to: "start", label: "0" },
      {
        id: "3",
        from: "2",
        to: "start",
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

    // const a = new Network(container, data, OPTIONS);

    this.networkInstance.on("selectNode", this.handleSelectedNodeEvent)

    this.networkInstance.on("doubleClick", this.handleDoubleClickEvent.bind(this))

    this.networkInstance.on("beforeDrawing", this.createArrowAndHalo.bind(this))

    this.networkInstance.on("delete", () => this.networkInstance.deletSelected().bind(this))


    //================================================================================
    // Custom keyboard bindings
    //================================================================================

    const networkKeyCharm = keycharm({
      container: container,
      preventDefault: true
    })

    networkKeyCharm.bind('delete', this.handleDeleteKeyEvent.bind(this), 'keydown');
  }

  /**
   * Check if selected element is start node
   * 
   * @returns 
   */
  private isStartNodeSelected(): boolean{
    var selectedNodes = this.networkInstance.getSelectedNodes();
    if(selectedNodes.length > 0) {
      if(selectedNodes[0] === "start") {
        return true;
      }
    }
    return false;
  }

  /**
   * Handle when delete key is pressed for network
   * 
   * Deletes selected nodes or edges, except the start node.
   * 
   * @param ev 
   */
  private handleDeleteKeyEvent(ev: KeyboardEvent) {
    if(!this.isStartNodeSelected()){
      this.networkInstance.deleteSelected();
    }
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

  private updateNode(nodeId: string) {
    this.toggleNodeFinal(nodeId);
  }

  private toggleNodeFinal(nodeId: string) {
    var node = this.NODES.get(nodeId);
    var coOrds: CoOrdinates = this.networkInstance.getPosition(nodeId);
    if(node) {
      node.final = !node.final
      node.x = coOrds.x
      node.y = coOrds.y
      this.NODES.update(node)
    }
  }

  private createNewNode(coOrdinates: CoOrdinates) {
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

  private createArrowAndHalo(ctx: any) {
    // creating arrow for start state

    // to make arrow on node 1 to represent it as start node
    const startNode = "start";
    const startNodePosition = this.networkInstance.getPositions([startNode]);
    // in order to keep the default dx as 30, we need to limit the length of node label, otherwise arrow and node will overlap
    const x1 = startNodePosition[startNode].x - 30;
    const y1 = startNodePosition[startNode].y;
    const x2 = startNodePosition[startNode].x - 80;
    const y2 = startNodePosition[startNode].y;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = this.color.border;
    ctx.stroke();

    const startRadians =
      Math.atan((y2 - y1) / (x2 - x1)) +
      ((x2 >= x1 ? -90 : 90) * Math.PI) / 180;

    ctx.save();
    ctx.beginPath();
    ctx.translate(x1, y1);
    ctx.rotate(startRadians);
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 18);
    ctx.lineTo(0, 16);
    ctx.lineTo(-5, 18);
    ctx.closePath();
    ctx.restore();
    ctx.fillStyle = this.color.border;
    ctx.fill();

    // creating outer circles for final states

    const finalNodesIds = this.NODES.getIds({
      filter: node => {
        return node.final;
      }
    });

    ctx.save();

    const finalNodePositions = this.networkInstance.getPositions(finalNodesIds);
    ctx.strokeStyle = this.color.border;
    finalNodesIds.forEach(value => {
      ctx.beginPath();
      ctx.arc(
        finalNodePositions[value].x,
        finalNodePositions[value].y,
        36,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    ctx.save();
  }

  getAllNodeDetails() {
    console.log(this.networkInstance.getPositions(this.NODES.getIds()))
  }

}
