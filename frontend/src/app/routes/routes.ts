import { Route } from "@angular/router";
import { WellcomeComponent } from "../pages/wellcome/wellcome.component";
import { LoginComponent } from "../pages/login/login.component";
import { RegisterComponent } from "../pages/register/register.component";
import { PasswordRecoveryComponent } from "../pages/password-recovery/password-recovey.component";
import { NewPasswordComponent } from "../pages/new-password/new-password.component";
import { QrCheckingComponent } from "../pages/qr-checking/qr-checking.component";
import { AddPetComponent } from "../pages/add-pet/add-pet.component";
import { MyPetComponent } from "../pages/my-pet/my-pet.component";
import { PageNotFoundComponent } from "../pages/page-not-found/page-not-found.component";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";
import { MyPetsComponent } from "../pages/my-pets/my-pets.component";
import { PetsComponent } from "../pages/pets/pets.component";
import { PetComponent } from "../pages/pet/pet.component";
import { PetFormComponent } from "../pages/pet-form/pet-form.component";
import { ConfirmMedalComponent } from "../pages/confirm-medal/confirm-medal.component";
import { PetFromHomeComponent } from "../pages/pet-from-home/pet-from-home.component";
import { HomeComponent } from "../pages/home/home.component";

export const routes: Route[] = [
    {
        path: '',
        component: WellcomeComponent
    },
    {
        path: 'wellcome',
        redirectTo: '',
        pathMatch: 'full'
    },
    {
        path: 'mascota-checking',
        component: QrCheckingComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'agregar-mascota/:medalString',
        component: AddPetComponent
    },
    {
        path: 'formulario-mi-mascota/:medalString',
        component: PetFormComponent
    },
    {
        path: 'confirmar-cuenta',
        component: ConfirmAccountComponent
    },
    {
        path: 'confirmar-medalla',
        component: ConfirmMedalComponent
    },
    {
        path: 'mi-mascota/:medalString',
        component: MyPetComponent
        
    },
    {
        path: 'mis-mascotas',
        component: MyPetsComponent
        
    },
    {
        path: 'mascotas',
        component: PetsComponent
        
    },
    {
        path: 'mascota/:medalString',
        component: PetComponent
        
    },
    {
        path: 'mascota-publica/:medalString',
        component: PetFromHomeComponent
        
    },
    {
        path: 'login',
        component: LoginComponent
    },
    // {
    //     path: 'register',
    //     component: RegisterComponent
    // },
    {
        path: 'recuperar-cuenta',
        component: PasswordRecoveryComponent
    },
    {
        path: 'crear-nueva-clave',
        component: NewPasswordComponent
    },
    {
        path: 'pagina-no-encontrada',
        component: PageNotFoundComponent
    },
    {
        path: '**',
        redirectTo: 'pagina-no-encontrada'
    }
];