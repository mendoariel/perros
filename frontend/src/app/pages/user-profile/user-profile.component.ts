import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.maxLength(50)]),
    phoneNumber: new FormControl('', []),
    bio: new FormControl('', [Validators.maxLength(500)]),
    address: new FormControl('', [Validators.maxLength(200)]),
    city: new FormControl('', [Validators.maxLength(100)]),
    country: new FormControl('', [Validators.maxLength(100)])
  });

  userProfile: any = null;
  isLoading = true;
  isSaving = false;
  isUploadingAvatar = false;
  subscription: Subscription[] = [];
  env = environment;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private uploadFileService: UploadFileService,
    private _snackBar: MatSnackBar,
    public navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProfile();
    }
  }

  loadProfile() {
    if (!this.authService.isAuthenticated()) {
      this.navigationService.goToLogin();
      return;
    }

    this.isLoading = true;
    const sub = this.userService.getUserProfile().subscribe({
      next: (profile: any) => {
        this.userProfile = profile;
        this.populateForm(profile);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
        this.openSnackBar('Error al cargar el perfil');
        this.cdr.detectChanges();
      }
    });
    this.subscription.push(sub);
  }

  populateForm(profile: any) {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || profile.phonenumber || '',
      bio: profile.bio || '',
      address: profile.address || '',
      city: profile.city || '',
      country: profile.country || ''
    });
  }

  onFileSelected(event: any) {
    if (!event?.target?.files?.length || this.isUploadingAvatar) {
      return;
    }

    const file = event.target.files[0];
    
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.openSnackBar('La imagen es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.openSnackBar('El archivo debe ser una imagen');
      return;
    }

    this.isUploadingAvatar = true;
    const formData = new FormData();
    formData.append('file', file);

    const sub = this.uploadFileService.uploadUserAvatar(formData).subscribe({
      next: (res: any) => {
        if (res && res.avatar) {
          this.userProfile.avatar = res.avatar;
          this.openSnackBar('Foto de perfil actualizada correctamente');
        }
        this.isUploadingAvatar = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error uploading avatar:', error);
        this.isUploadingAvatar = false;
        this.openSnackBar('Error al subir la foto de perfil');
        this.cdr.detectChanges();
      }
    });
    this.subscription.push(sub);
  }

  saveProfile() {
    if (this.profileForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const sub = this.userService.updateUser(this.profileForm.value).subscribe({
      next: (updatedProfile: any) => {
        this.userProfile = { ...this.userProfile, ...updatedProfile };
        this.openSnackBar('Perfil actualizado correctamente');
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        this.openSnackBar('Error al actualizar el perfil');
        this.cdr.detectChanges();
      }
    });
    this.subscription.push(sub);
  }

  getAvatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${this.env.perrosQrApi}${avatar}`;
  }

  getUserDisplayName(): string {
    if (!this.userProfile) return 'Usuario';
    
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    if (this.userProfile.firstName) {
      return this.userProfile.firstName;
    }
    if (this.userProfile.username) {
      return this.userProfile.username;
    }
    return this.userProfile.email?.split('@')[0] || 'Usuario';
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(MessageSnackBarComponent, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      data: message
    });
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}
