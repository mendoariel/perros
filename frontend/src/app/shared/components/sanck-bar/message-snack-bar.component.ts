import { Component, Inject, inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";
import { MaterialModule } from "src/app/material/material.module";

@Component({
    selector: 'app-message-snack-bar',
    templateUrl: './message-snack-bar.component.html',
    styleUrls: ['./message-snack-bar.component.scss'],
    imports: [MaterialModule],
    standalone: true
})
export class MessageSnackBarComponent {
    snackBarRef = inject(MatSnackBarRef);
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

    closeSnackbar() {
        this.snackBarRef.dismiss();
    }
}