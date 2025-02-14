import { Route } from "@angular/router";
import { FriasComponent } from "../pages/frias/frias.component";
import { HomeComponent } from "../pages/home/home.component";
import { WellcomeComponent } from "../pages/wellcome/wellcome.component";
import { LoginComponent } from "../pages/login/login.component";
import { RegisterComponent } from "../pages/register/register.component";
import { AuthGuardService } from "../auth/guards/auth-guard.services";
import { BikeParkCreatorComponent } from "../pages/bike-park-creator/bike-park-creator.component";
import { RoleGuardService } from "../auth/guards/role-guard.service";
import { AddFriasElementComponent } from "../pages/add-frias-element/add-frias-element.component";
import { PasswordRecoveryComponent } from "../pages/password-recovery/password-recovey.component";
import { NewPasswordComponent } from "../pages/new-password/new-password.component";
import { WebDeveloperComponent } from "../pages/web-developer/web-developer.component";
import { QrCheckingComponent } from "../pages/qr-checking/qr-checking.component";
import { AddPetComponent } from "../pages/add-pet/add-pet.component";
import { MyPetComponent } from "../pages/my-pet/my-pet.component";
import { PageNotFoundComponent } from "../pages/page-not-found/page-not-found.component";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";
import { MyPetsComponent } from "../pages/my-pets/my-pets.component";
import { PetsComponent } from "../pages/pets/pets.component";
import { PetComponent } from "../pages/pet/pet.component";

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
        path: 'agregar-mascota/:medalHash/:registerHash',
        component: AddPetComponent
    },
    {
        path: 'confirmar-cuenta',
        component: ConfirmAccountComponent
    },
    {
        path: 'mi-mascota',
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
        path: 'mascota',
        component: PetComponent
        
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
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