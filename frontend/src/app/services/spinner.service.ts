import { Injectable, signal } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({providedIn: 'root'})
export class SpinnerService {
    private spinnerStatus = new BehaviorSubject(true);
    spinnerStatus$ = this.spinnerStatus.asObservable();

    spinnerON() {
        this.spinnerStatus.next(true)
    }

    spinnerOFF() {
        this.spinnerStatus.next(false)
    }
}