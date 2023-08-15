export type FrankerfacezEmote = {
    id: string
    name: string
    urls: {
        1: string
        2: string
        4: string
    },
    animated?: {
        1: string
        2: string
        4: string
    }
}

export type FrankerfacezEmoteResponse = {
    sets: {[key: string]: FrankerfacezSet}
}

export type FrankerfacezSet = {
    emoticons: FrankerfacezEmote[]
}
