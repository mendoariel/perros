import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { leastOneCapitalLetterValidator } from 'src/app/shared/custom-validators/least-one-capital-letter.directive';
import { leastOneLowerCaseValidator } from 'src/app/shared/custom-validators/least-one-lower-case.directive';
import { leastOneNumberValidator } from 'src/app/shared/custom-validators/least-one-number.directive';
import { confirmedValidator } from 'src/app/shared/custom-validators/confirmed-validator.directive';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { MedalInterface, RegisteredMedalInterface } from 'src/app/interface/medals.interfae';

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FirstNavbarComponent
  ],
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss']
})
export class AddPetComponent implements OnInit {
  medalString = '';
  registerHash = '';

  registerForm: FormGroup = new FormGroup({
    petName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    ownerEmail: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(50),
      leastOneCapitalLetterValidator(),
      leastOneLowerCaseValidator(),
      leastOneNumberValidator()
    ]),
    passwordConfirm: new FormControl('', [Validators.required]),
  }, { validators: confirmedValidator('password', 'passwordConfirm') });
  subscription: Subscription[] = [];
  pwdHide = true;
  pwdConfirmHide = true;
  addPet = false;
  registeredMedal: any;
  spinner = false;
  spinnerMessage = '';
  newClient = false;
  validationDoIt = false;
  emailValue = '';
  emailTaken: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private qrService: QrChekingService
  ) { }

  ngOnInit(): void {
    this.medalString = this.route.snapshot.params['medalString'];
    this.registerHash = this.route.snapshot.params['registerHash'];
  }

  goHome() {
    this.router.navigate(['/wellcome'])
  }

  register() {
    let body: any = this.registerForm.value;
    body.medalString = this.medalString;
    body.medalRegister = this.registerHash;
    delete body.passwordConfirm;
    this.spinner = true;
    this.spinnerMessage = 'procensando información...';

    let authSubscription: Subscription = this.qrService.medalRegister(body).subscribe(
      (res: any) => {
        //this.router.navigate(['/wellcome']);
        this.spinner = false;
        this.registeredMedal = res;
        this._snackBar.openFromComponent(MessageSnackBarComponent, {
          duration: 6000,
          verticalPosition: 'top',
          data: `${res.text}`
        });
        this.addPet = true;
      }, error => {
        this.spinner = false;
        console.error(error)
        if (error.error && error.status === 500) this._snackBar.openFromComponent(MessageSnackBarComponent, {
          duration: 5000,
          verticalPosition: 'top',
          data: 'No se pudo registar su medalla'
        })
        if (error.error && error.status === 400) this._snackBar.openFromComponent(MessageSnackBarComponent, {
          duration: 5000,
          verticalPosition: 'top',
          data: error.error.message[0]
        })

      }
    );
    this.addSubscription(authSubscription);
  }

  cancelMethod() {
    this.newClient = false;
    this.validationDoIt = false;
    this.emailValue = '';
    this.emailTaken = false;
    this.ownerEmail?.setValue('');
    this.ownerEmail?.clearValidators();
    this.ownerEmail?.setValidators([Validators.required, Validators.email])
    this.ownerEmail?.enable();
  }

  emailValidate() {
    this.spinner = true;
    let subscription: Subscription = this.qrService.isThisEmailTaken(this.ownerEmail?.value).subscribe({
      next: (res: any)=>{
        this.emailValue = this.ownerEmail?.value;
        this.validationDoIt = true;
        this.spinner = false;
        if(res.emailIsTaken) {
          this.newClient = false;
          this.password?.clearValidators();
          this.passwordConfirm?.clearValidators();
        } else {
          this.newClient = true;
        }
      },
      error: (error: any)=>{
        console.error(error);
        this.spinner = false;
      }
    });
  }

  getVisibility() {
    return this.pwdHide ? 'visibility_off' : 'visibility';
  }

  getInputType() {
    return this.pwdHide ? 'password' : 'text';
  }

  visibilityToggle() {
    this.pwdHide = !this.pwdHide;
  }

  getIconToMinLength(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('minlength') ? 'cancel' : 'check';
  }

  getIconToMaxLength(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('maxlength') ? 'cancel' : 'check';
  }

  getIconUpperCase(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('capitalLetterError') ? 'cancel' : 'check';
  }

  getIconLowerCase(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('lowerCaseError') ? 'cancel' : 'check';
  }

  getIconNumber(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('numberError') ? 'cancel' : 'check';
  }

  addSubscription(subscripiont: Subscription) {
    this.subscription.push(subscripiont);
  }

  visibilityTogglePasswordConfirm() {
    this.pwdConfirmHide = !this.pwdConfirmHide;
  }

  getVisibilityPasswordConfirm() {
    return this.pwdConfirmHide ? 'visibility_off' : 'visibility';
  }

  getInputTypePasswordConfirm() {
    return this.pwdConfirmHide ? 'password' : 'text';
  }

  get petName(): FormControl | undefined {
    if (this.registerForm.get('petName')) {
      return this.registerForm.get('petName') as FormControl;
    } else return undefined;
  }

  get ownerEmail(): FormControl | undefined {
    if (this.registerForm.get('ownerEmail')) {
      return this.registerForm.get('ownerEmail') as FormControl;
    } else return undefined;
  }

  get password(): FormControl | undefined {
    if (this.registerForm.get('password')) {
      return this.registerForm.get('password') as FormControl;
    } else return undefined;
  }

  get passwordConfirm(): FormControl | undefined {
    if (this.registerForm.get('passwordConfirm')) {
      return this.registerForm.get('passwordConfirm') as FormControl;
    } else return undefined;
  }

  ngOnDestroy(): void {
    this.subscription.map((subscription: Subscription) => subscription.unsubscribe());
  }
}
