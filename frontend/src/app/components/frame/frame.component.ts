import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css']
})
export class FrameComponent implements OnInit {

  constructor() { }

  public scrollToTop(): void {
    const element = document.querySelector('#wrapper');
    if (element) {
      element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }
  }

  ngOnInit(): void {
    // Toggle the side navigation
    $('#sidebarToggle, #sidebarToggleTop').on('click', e => {
      $('body').toggleClass('sidebar-toggled');
      $('.sidebar').toggleClass('toggled');
      if ($('.sidebar').hasClass('toggled')) {
        $('.sidebar .collapse').toggle();
      }
    });
  }

}
