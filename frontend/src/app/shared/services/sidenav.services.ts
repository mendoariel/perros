import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({providedIn: 'root'})
export class SidenavService {
    private sidenavStatus = new BehaviorSubject<boolean>(false);
    sidenavStatus$ = this.sidenavStatus.asObservable();

    openSidenav() {
        this.sidenavStatus.next(true)
        console.log('openig sidenav')
    }

    closeSidenav() {
        this.sidenavStatus.next(false)
    }

}