import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { BackToolbarComponent } from 'src/app/shared/components/back-toolbar/back-toolbar.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-frias-element',
  standalone: true,
  imports: 
  [
    BackToolbarComponent,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    ReactiveFormsModule
  ],
  templateUrl: './add-frias-element.component.html',
  styleUrls: ['./add-frias-element.component.scss']
})
export class AddFriasElementComponent {
  addFriasElementForm = new FormGroup({
    title: new FormControl('')
  });
}
