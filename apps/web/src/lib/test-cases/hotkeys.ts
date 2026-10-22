export type CreateHotkeyTarget = 'test-case' | 'section';
export type HotkeyEvent = Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'altKey' | 'code' | 'key'>;

export function resolveCreateHotkey(e: HotkeyEvent): CreateHotkeyTarget | null {
    return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' ? 'test-case' : null;
}