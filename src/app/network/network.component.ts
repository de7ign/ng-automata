import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { NodeItem, EdgeItem } from '../interface/network';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements AfterViewInit {

  @ViewChild('network') el!: ElementRef;
  networkInstance: any;

  ngAfterViewInit() {
     const container = this.el.nativeElement;

     const nodes = new DataSet<NodeItem>([
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

    const edges = new DataSet<EdgeItem>([
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

    const data = { nodes, edges }

    const OPTIONS = {
      nodes: {
        shape: "circle",
        color: {
          border: 'hsl(198, 100%, 24%)',
          background: 'hsl(198, 66%, 57%)',
          highlight: {
            border: 'hsl(198, 100%, 24%)',
            background: 'hsl(198, 69%, 69%)'
          }
        },
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
  }
}
