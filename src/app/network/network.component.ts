import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Network } from 'vis-network/peer';
import { DataSet } from 'vis-data/peer';

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
     const nodes = new DataSet<any>([
        {id: 1, label: 'Node 1'},
        {id: 2, label: 'Node 2'},
        {id: 3, label: 'Node 3'},
        {id: 4, label: 'Node 4'},
        {id: 5, label: 'Node 5'}
    ]);

    const edges = new DataSet<any>([
        {from: 1, to: 3},
        {from: 1, to: 2},
        {from: 2, to: 4},
        {from: 2, to: 5}
    ]);

    const data = { nodes, edges };

    const options = {};

    this.networkInstance = new Network(container, data, options);
  }

}
