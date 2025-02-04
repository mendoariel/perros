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
  hash = '';

  constructor(private router: ActivatedRoute) {}

  ngOnInit(): void {
    this.hash = this.router.snapshot.params['hash'];
    console.log(this.hash)
  }
}
