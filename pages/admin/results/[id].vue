<script setup lang="ts">
const config = useRuntimeConfig();
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<Results :base="config.public.pollApiBase + '/admin'" />
</template>
