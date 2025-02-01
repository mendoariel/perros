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

export const routes: Route[] = [
    {
        path: '',
        component: WellcomeComponent
    },
    {
        path: 'web-developer/3956-albert',
        component: WebDeveloperComponent
    },
    {
        path: 'wellcome',
        component: WellcomeComponent
    },
    {
        path: 'frias',
        component: FriasComponent
    },
    {
        path: 'add-frias-element',
        component: AddFriasElementComponent,
        canActivate: [RoleGuardService],
        data: {
            expectedRole: 'FRIAS_EDITOR'
        }
    },
    {
        path: 'create-bike-park',
        component: BikeParkCreatorComponent,
        canActivate: [RoleGuardService],
        data: {
            expectedRole: 'admin'
        }
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
        path: '**',
        redirectTo: '/home'
    }
];