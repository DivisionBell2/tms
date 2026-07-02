<script lang="ts">
	import { page } from "$app/stores";

    interface NavItem {
        href: string;
        label: string;
        icon: string;
        disabled?: boolean;
    }

    const ITEMS: NavItem[] = [
        { href: '/test-cases', label: 'Тест-кейсы', icon: 'checklist'},
        { href: '/checklists', label: 'Чек-листы', icon: 'fact_check', disabled: true },
        { href: '/test-plans', label: 'Тест-планы', icon: 'event_note', disabled: true },
        { href: '/profile', label: 'Профиль', icon: 'person'},
    ];

    function isActive(href: string): boolean {
        return $page.url.pathname.startsWith(href);
    }
</script>

<nav class="side-nav" aria-label="Разделы">
    {#each ITEMS as item (item.href)}
        {#if item.disabled}
            <span class="nav-item disabled" title="Появится в будущем">
                <span class="icon" aria-hidden="true">{item.icon}</span>
                {item.label}
            </span>
        {:else}
            <a
                class="nav-item"
                class:active={isActive(item.href)}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
            >
                <span class="icon" aria-hidden="true">{item.icon}</span>
                    {item.label}
            </a>
        {/if}
    {/each}
</nav>

<style>
    .side-nav {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        padding: var(--space-md);
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-sm);
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
    }

    .nav-item:hover:not(.disabled) {
        background: var(--accent);
    }

    .nav-item.active {
        background: var(--accent);
        color: var(--on-accent);
    }

    .nav-item.disabled {
        color: var(--text-muted);
        cursor: not-allowed;
    }
</style>