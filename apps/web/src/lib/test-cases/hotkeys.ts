export type CreateHotkeyTarget = 'test-case' | 'section';
export type HotkeyEvent = Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'altKey' | 'code' | 'key'>;

export function resolveCreateHotkey(e: HotkeyEvent): CreateHotkeyTarget | null {
    if (!e.ctrlKey && !e.metaKey) return null;
    if (e.code !== 'KeyN') return null;
    return e.altKey ? 'section' : 'test-case';
}