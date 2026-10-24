import { resolveCreateHotkey } from "$lib/test-cases/hotkeys";
import { describe, expect, it } from "vitest";

function press(init: KeyboardEventInit): KeyboardEvent {
    return new KeyboardEvent('keydown', init);
}

describe('resolveCreateHotkey', () => {
    it('Ctrl + N открывает модалку тест-кейса', () => {
        expect(resolveCreateHotkey(press({ ctrlKey: true, key: 'n', code: 'KeyN'}))).toBe('test-case');
    });

    it('⌘ + N открывает модалку тест-кейса', () => {
        expect(resolveCreateHotkey(press({ metaKey: true, key: 'n', code: 'KeyN'}))).toBe('test-case');
    });

    it('Ctrl + Alt + N открывает модалку раздела, а не обе сразу', () => {
        expect(resolveCreateHotkey(press({ ctrlKey: true, altKey: true, key: 'n', code: 'KeyN'}))).toBe('section');
    });

    it('⌘ + ⌥ + N на macOS: Option + N дает key "˜", но сочетание работает', () => {
        expect(resolveCreateHotkey(press({ metaKey: true, altKey: true, key: '˜', code: 'KeyN'}))).toBe('section');
    });

    it('русская раскладка: key "Т", физическая клавиша та же', () => {
        expect(resolveCreateHotkey(press({ ctrlKey: true, key: 'т', code: 'KeyN'}))).toBe('test-case');
        expect(resolveCreateHotkey(press({ ctrlKey: true, altKey: true, key: 'т', code: 'KeyN'}))).toBe('section');
    });

    it('⌘/Ctrl + B - не наше сочетание', () => {
        expect(resolveCreateHotkey(press({ ctrlKey: true, key: 'b', code: 'KeyB'}))).toBeNull();
    });

    it('просто N в поле фильтра не открывает ничего', () => {
        expect(resolveCreateHotkey(press({ key: 'n', code: 'KeyN'}))).toBeNull();
    });

    it('Alt + N без ⌘/Ctrl не открывает ничего', () => {
        expect(resolveCreateHotkey(press({ altKey: true, key: 'n', code: 'KeyN'}))).toBeNull();
    });
});