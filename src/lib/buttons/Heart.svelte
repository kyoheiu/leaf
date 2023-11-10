<script lang="ts">
	import { scale } from 'svelte/transition';
	import { ICON_SIZE } from './const';
</script>

<img in:scale src="/heart.svg" alt="toggke liked" width={ICON_SIZE} />
