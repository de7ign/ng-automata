import { DataSet } from "vis-data/peer";
import { NodeItem, EdgeItem } from "../interface/network";

const initNode = new DataSet<NodeItem>([
    {
      id: "start",
      label: "start",
      final: false,
      x: -184,
      y: -41
    },
    {
      id: "2",
      label: "A",
      final: true,
      x: 11,
      y: -40
    }
  ]);

const initEdge = new DataSet<EdgeItem>([
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

  const color = {
    border: 'hsl(198, 100%, 24%)',
    background: 'hsl(198, 66%, 57%)',
    highlight: {
      border: 'hsl(198, 100%, 24%)',
      background: 'hsl(198, 69%, 69%)'
    }
  }

  const initOptions = {
    nodes: {
      shape: "circle",
      color: color,
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
      smooth: {
        enabled: true,
        type: "continuous",
        roundness: 0.0
      }
    },
    physics: {
      enabled: false
    },
    interaction: {
      selectConnectedEdges: false
    }
  };

export const InitData = {
    'node': initNode,
    'edge': initEdge,
    'colorScheme': color,
    'networkOptions': initOptions
}