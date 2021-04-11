import {Component, Input, OnInit} from '@angular/core';
import {SimpleKeyboardLanguageEnum} from "../enumerators/simple-keyboard-language.enum";
import {CdkOverlayOrigin} from "@angular/cdk/overlay";

import Keyboard from 'simple-keyboard';
// @ts-ignore
import FrenchLayout from 'simple-keyboard-layouts/build/layouts/french';

const CUSTOM_ARABIC_LAYOUT = {
    layout: {
        default: [
            "1 2 3 4 5 6 7 8 9 0 - = {bksp}",
            "\u0630 \u0636 \u0635 \u062B \u0642 \u0641 \u063A \u0639 \u0647 \u062E \u062D \u062C \u062F \\",
            "\u0634 \u0633 \u064A \u0628 \u0644 \u0627 \u062A \u0646 \u0645 \u0643 \u0637",
            "\u0626 \u0621 \u0624 \u0631 \u0644\u0627 \u0649 \u0629 \u0648 \u0632 \u0638",
            "{space}",
        ]
    },
};


@Component({
    selector: 'app-rnp-custom-simple-keyboard',
    templateUrl: './rnp-custom-simple-keyboard.component.html',
    styleUrls: ['./rnp-custom-simple-keyboard.component.css']
})
export class RnpCustomSimpleKeyboardComponent implements OnInit {

    @Input() inputClassIdentificator: string | undefined;
    @Input() inputOriginTrigger: CdkOverlayOrigin | undefined;
    @Input() simpleKeyboardLanguage: SimpleKeyboardLanguageEnum | undefined;

    keyboard: Keyboard | null;
    isOpenOverlaySimpleKeyboard: boolean;
    trigger: CdkOverlayOrigin | undefined;


    constructor() {
        this.keyboard = null;
        this.isOpenOverlaySimpleKeyboard = false;
    }

    ngOnInit(): void {
    }

    onInputSimpleKeyboardHandlerClickHandler(
        inputClassIdentificator: string | undefined,
        originTrigger: CdkOverlayOrigin | undefined
    ): void {
        if (inputClassIdentificator && originTrigger && !this.isOpenOverlaySimpleKeyboard) {
            this.onInputFocusInOpenSimpleKeyboardHandler(inputClassIdentificator, originTrigger);
        } else {
            this.onInputFocusOutDestroyAndCloseSimpleKeyboardHandler();
        }
    }

    onInputFocusInOpenSimpleKeyboardHandler(
        inputClassIdentificator: string | undefined,
        originTrigger: CdkOverlayOrigin | undefined
    ): void {
        if (inputClassIdentificator && originTrigger) {
            this.isOpenOverlaySimpleKeyboard = true;
            this.trigger = originTrigger;
            setTimeout(() => {
                this.keyboard = new Keyboard({
                    onChange: (input: any) => this.onKeyboardInputChange(inputClassIdentificator, input),
                    onKeyPress: (button: any) => this.onKeyboardKeyPress(button),
                    ...this.getSimpleKeyboardLanguageLayout(),
                    rtl: (this.simpleKeyboardLanguage === SimpleKeyboardLanguageEnum.Arabic)
                });
            }, 300);
        }
    }

    onInputFocusOutDestroyAndCloseSimpleKeyboardHandler(): void {
        if (this.keyboard) {
            this.keyboard.destroy();
        }
        this.isOpenOverlaySimpleKeyboard = false;
    }

    private onKeyboardInputChange(inputClassIdentificator: string, input: any): void {
        // @ts-ignore
        document.querySelector(`#${inputClassIdentificator}`).value = input;
    }

    private onKeyboardKeyPress(button: any): void {
        // console.log('Button pressed', button);
    }

    private getSimpleKeyboardLanguageLayout(): any | undefined {
        return (this.simpleKeyboardLanguage === SimpleKeyboardLanguageEnum.Arabic) ? CUSTOM_ARABIC_LAYOUT : FrenchLayout;
    }

}
