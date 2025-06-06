
export interface PopoutSidenavEntry {
    id: string;
    imageName: string;
    fallbackImagePath: string;
    name: string;
    type: string;
    comments: string;
}

export function SortPopoutSidenavEntries(entries: PopoutSidenavEntry[]): PopoutSidenavEntry[] {
    var entriesCopy: PopoutSidenavEntry[] = entries.slice(0);

    entriesCopy.sort((l, r) => l.name.localeCompare(r.name));

    return entriesCopy;
}