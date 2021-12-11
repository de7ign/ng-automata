import { Component, OnInit, isDevMode } from '@angular/core';
import {ClarityIcons, atomIcon} from '@cds/core/icon';
import {Location} from '@angular/common';

ClarityIcons.addIcons(atomIcon);

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private loc: Location) { }

  originUrl = "";
  devMode: boolean = isDevMode();

  ngOnInit(): void {
    this.originUrl = window.location.origin;
  }
}
