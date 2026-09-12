<script lang="ts">
    const sandboxes = [
        {
            href: '/dev/steps',
            title: 'Шаги воспроизведения',
            description: 'StepsTable и InlineEditTable: ввод, удаление, drag-and-drop',
            origin: 'Срез 4, Шаг 9'
        },
    ]
</script>

<h1>Песочница компонентов</h1>

<ul class=list>
    {#each sandboxes as item (item.href)}
        <li>
            <a class="card" href={item.href}>
                <span class="title">{item.title}</span>
                <span class="desc">{item.description}</span>
                <span class="origin">{item.origin}</span>
            </a>
        </li>
    {/each}
</ul>

<style>
    h1 {
        margin: 0;
        font-size: 1.5rem;
    }

    .list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
        gap: var(--space-lg);
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .card {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        height: 100%;
        padding: var(--space-md);
        background-color: var(--surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        color: var(--text);
        text-decoration: none;
    }

    .title {
        font-weight: 600;
    }

    .desc,
    .origin {
        color: var(--text-muted);
        font-size: 0.875rem;
    }
</style>