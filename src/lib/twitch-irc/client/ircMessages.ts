const CAP = (values: string[]) => {
    if (values.length <= 0)
        throw new Error("Values can't be empty")

    let filteredValues = values.filter(x => x.length > 0)
    if (filteredValues.length <= 0)
        throw new Error("Values can't be empty")

    const joinedCapabilitiesString = filteredValues.join(" ")

    return `CAP REQ :${joinedCapabilitiesString}`
}

const PASS = (value: string) => {
    if (!value || value.length <= 0)
        throw new Error("Value can't be empty.")

    return `PASS ${value}`
}

const NICK = (value: string) => {
    if (!value || value.length <= 0)
        throw new Error("Value can't be empty.")

    return `NICK ${value}`
}

const JOIN = (values: string[]) => {
    if (values.length <= 0)
        throw new Error("Values can't be empty")

    let filteredValues = values.filter(x => x.length > 0)
    if (filteredValues.length <= 0)
        throw new Error("Values can't be empty")

    filteredValues = filteredValues.map(x => "#" + x);
    const joinedChannelsString = filteredValues.join(",")

    return `JOIN ${joinedChannelsString}`;
}

const PONG = () => {
    return "PONG :tmi.twitch.tv"
}

export const REQUESTS = {
    CAP,
    PASS,
    NICK,
    JOIN,
    PONG
}