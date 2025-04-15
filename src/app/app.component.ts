import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { ContentInputGroupComponent } from './pages/content-input-group/content-input-group.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SharedModule, ContentInputGroupComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  param: {
    inputText?: string
  } = {};

  ngOnInit(): void {
  }

  inputChange($event: string) {
    this.param.inputText = $event;
    this.search();
  }

  search() {
    console.log('search', this.param);
  }
}
