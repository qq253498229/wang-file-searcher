import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'wang-location-group',
  imports: [CommonModule, SharedModule],
  templateUrl: './location-group.component.html',
  styleUrl: './location-group.component.scss',
})
export class LocationGroupComponent {

}
