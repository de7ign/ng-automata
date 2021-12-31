import { AfterViewInit, OnInit, Component, ElementRef, ViewChild, isDevMode } from '@angular/core';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';
import { NodeItem, EdgeItem, CoOrdinates, ColorScheme } from '../interface/network';
import * as shortUUID from 'short-uuid';
import keycharm from 'keycharm';
import { InitData } from "./network-init-data";
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements AfterViewInit, OnInit {

  @ViewChild('network') el!: ElementRef;
  private networkInstance!: Network;
  private NODES: DataSet<NodeItem> = InitData.node;
  private EDGES: DataSet<EdgeItem> = InitData.edge;
  private colorScheme!: ColorScheme;

  private nodeDetails: NodeItem = {
    id: "id",
    x: 0,
    y: 0,
    label: "state name",
    final: true
  }

  //=================================================================
  // UI Variables
  //=================================================================
  nodeLabelForm!: FormGroup;
  viewNodeLabelModal: boolean = false;
  devMode: boolean = isDevMode();

  //=================================================================

  ngOnInit(): void {
    console.log("called on init");
    this.nodeLabelForm = new FormGroup({
      nodeLabelInput: new FormControl('', Validators.required)
    });
  }

  ngAfterViewInit() {
    console.log("called after view init");
    const container = this.el.nativeElement;
    this.NODES = InitData.node
    this.EDGES = InitData.edge;
    this.colorScheme = InitData.colorScheme;

    this.networkInstance = new Network(container, 
      { nodes: this.NODES, edges: this.EDGES }, 
      InitData.networkOptions);

    this.networkInstance.on("selectNode", this.handleSelectedNodeEvent)

    this.networkInstance.on("doubleClick", this.handleDoubleClickEvent.bind(this))

    this.networkInstance.on("beforeDrawing", this.createArrowAndHalo.bind(this))


    //================================================================================
    // Custom keyboard bindings
    //================================================================================

    const networkKeyCharm = keycharm({
      container: container,
      preventDefault: true
    })

    networkKeyCharm.bind('delete', this.handleDeleteKeyEvent.bind(this), 'keydown');
  }

  //=================================================================
  // Event Handlers
  //=================================================================

  //Network Events
  //=================================================================
  /**
   * Handle when a node is selected
   * 
   * @param params 
   */
  private handleSelectedNodeEvent(params: any) {
    console.log("handleSelectedNodeEvent");
    console.log(params);
  }

  /**
   * Handle when a double click mouse event is raised inside the network
   * 
   * @param params 
   */
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

    if (nodes[0]) {
      // double clicked on a existing node, toggle the final property
      this.updateNode(nodes[0]);
    } else if (!edges[0]) {
      // clicked on empty canvas so create a new node
      var coOrdinates: CoOrdinates = { x, y };
      this.createNewNode(coOrdinates);
    }
  }

  /**
   * Draws start arrow and extra circle in final nodes
   * Triggered before network display in screen
   * 
   * @param ctx 
   */
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
    ctx.strokeStyle = this.colorScheme.border;
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
    ctx.fillStyle = this.colorScheme.border;
    ctx.fill();

    // creating outer circles for final states

    const finalNodesIds = this.NODES.getIds({
      filter: node => {
        return node.final;
      }
    });

    ctx.save();

    const finalNodePositions = this.networkInstance.getPositions(finalNodesIds);
    ctx.strokeStyle = this.colorScheme.border;
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

  /**
   * Handle when delete key is pressed for network
   * 
   * Deletes selected nodes or edges, except the start node.
   * 
   * @param ev 
   */
  private handleDeleteKeyEvent(ev: KeyboardEvent) {
    if (!this.isStartNodeSelected()) {
      this.networkInstance.deleteSelected();
    }
  }

  // HTML Events
  //=================================================================
  /**
   * Close the node label input modal
   * 
   * @param submit 
   */
  handleNodeLabelClose(submit: boolean) {
    console.log("handleNodeLabelClose");
    var node = this.nodeDetails;
    if (submit) {
      node.label = this.nodeLabelForm.get('nodeLabelInput')?.value;
      this.NODES.update(node)
    } else {
      // cannot create a node without a user input label
      // delete the node
      this.NODES.remove(node.id);
    }
    this.nodeLabelForm.reset();
    this.viewNodeLabelModal = false;
    this.clearNodeDetails()
  }

  //=================================================================
  //Utility
  //=================================================================

  /**
   * Check if selected element is a start node
   * 
   * @returns 
   */
  private isStartNodeSelected(): boolean {
    var selectedNodes = this.networkInstance.getSelectedNodes();
    if (selectedNodes.length > 0) {
      if (selectedNodes[0] === "start") {
        return true;
      }
    }
    return false;
  }

  /**
   * Updates the node
   * 
   * @param nodeId
   */
  private updateNode(nodeId: string) {
    this.toggleNodeFinal(nodeId);
  }

  /**
   * Toggles and update the final property of node
   * 
   * @param nodeId 
   */
  private toggleNodeFinal(nodeId: string) {
    var node = this.NODES.get(nodeId);
    var coOrds: CoOrdinates = this.networkInstance.getPosition(nodeId);
    if (node) {
      node.final = !node.final
      node.x = coOrds.x
      node.y = coOrds.y
      this.NODES.update(node)
    }
  }

  /**
   * Clear the proxy node
   */
  private clearNodeDetails() {
    this.nodeDetails = {
      id: "id",
      x: 0,
      y: 0,
      label: "state name",
      final: false
    }
  }

  /**
   * Create/Add a new node to network at the supplied coordinates
   * 
   * @param coOrdinates 
   */
  private createNewNode(coOrdinates: CoOrdinates) {
    console.log("createNewNode");
    this.viewNodeLabelModal = true;
    var node: NodeItem = {
      id: shortUUID.generate(),
      final: false,
      label: "new node",
      x: coOrdinates.x,
      y: coOrdinates.y
    };
    this.NODES.update(node)
    this.nodeDetails = node;
  }

  //=================================================================
  // Developer tools
  //=================================================================
  /**
   * print all node details
   */
  getAllNodeDetails() {
    console.log("All node details " + this.getJsonString(this.NODES.get()));
  }

  /**
   * print all edge details
   */
  getAllEdgeDetails() {
    console.log("All edge details " + this.getJsonString(this.EDGES.get()));
  }

  /**
   * print all variables
   */
  getAllDetails() {
    this.getAllNodeDetails();
    this.getAllEdgeDetails();
    console.log("Proxy node detail " + this.getJsonString(this.nodeDetails))
    console.log("Node label input " + this.nodeLabelForm.get('nodeLabelInput')?.value);
  }

  /**
   * return Json equivalent of Object 
   * 
   * @param o 
   * @returns 
   */
  getJsonString(o: Object): string {
    return JSON.stringify(o, null, 2)
  }

}
