import {defineStore} from 'pinia'

export const configStore = defineStore('overlay', {
    state: () => ({
        overlayState: true
    }),

    actions: {
        enableOverlay(overlayStatus){
            this.overlayState = overlayStatus
        }
    }
})