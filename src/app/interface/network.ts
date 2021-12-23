export interface NodeItem {
    id: string
    label: string
    final: boolean
    x: number
    y: number
}

export interface EdgeSmooth {
    type: string
    roundness: number
}

export interface CoOrdinates {
    x: number
    y: number
}

export interface EdgeItem {
    id: string
    to: string
    from: string
    label: string
    smooth?: any | EdgeSmooth
}

interface ColorScheme_highlight {
    border: string
    background: string
}
export interface ColorScheme {
    border: string
    background: string
    highlight: ColorScheme_highlight
}
