import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss']
})
export class AddPetComponent implements OnInit{
  medalHash = '';
  registerHash = '';

  constructor(private router: ActivatedRoute) {}

  ngOnInit(): void {
    this.medalHash = this.router.snapshot.params['medalHash'];
    this.registerHash = this.router.snapshot.params['registerHash'];
    console.log(this.medalHash, '    ',this.registerHash)
  }
}
