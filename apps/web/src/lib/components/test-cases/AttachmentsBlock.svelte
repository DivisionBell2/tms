<script lang="ts">

</script>

<section class="attachments" aria-label="Вложения">
    <header class="head">
        <h2>
            <span class="icon" aria-hidden="true">attach_file</span>
            Вложения
        </h2>
    </header>
    <div class="stub">
        <span class="icon big" aria-hidden="true">info</span>
        <p> Прикрепление файлов к тест-кейсу появится в следующем срезе</p>
    </div>
</section>

<style>
    .attachments {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .head h2 {
        align-items: center;
        gap: var(--space-sm);
        margin: 0;
        font-size: 1.125rem;
    }

    .stub {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-xl);
        background: var(--surface);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-1);
        color: var(--text-muted);
        text-align: center;
    }

    .stub p {
        margin: 0;
        max-width: 28rem;
    }

    .big {
        font-size: 2rem;
    }
</style>