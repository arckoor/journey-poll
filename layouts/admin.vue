<template>
	<Title>Journey Polls - ADMIN</Title>
	<div class="adminWrapper">
		<div class="sidenav">
			<ul class="navList">
				<li class="navItem">
					<NuxtLink href="/admin/list">
						<SvgList :class="'icon' + ($route.path === '/admin/list' ? ' highlight' : '')" />
					</NuxtLink>
				</li>
				<li class="navItem">
					<NuxtLink to="/admin/create">
						<SvgCreate :class="'icon' + ($route.path === '/admin/create' ? ' highlight' : '')" />
					</NuxtLink>
				</li>
				<li :class="'navItem' + ($route.path.startsWith('/admin/edit') ? '' : ' inactive')">
					<SvgEdit :class="'icon' + ($route.path.startsWith('/admin/edit') ? ' highlight' : '')" />
				</li>
			</ul>
			<div @click="logout" class="logout">
				<SvgLogout class="icon" />
			</div>
		</div>
		<div class="slotContainer">
			<h1 class="sectionHeading">{{ determineHeading() }}</h1>
			<slot />
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig()
		};
	},
	methods: {
		async logout() {
			await fetch(this.config.public.pollApiBase + "/admin/logout", {
				method: "POST",
				credentials: "include"
			});
			navigateTo("/");
		},
		determineHeading() {
			const path = this.$route.fullPath;
			if (path.startsWith("/admin/results")) return "Results";
			else if (path.startsWith("/admin/list")) return "Created polls";
			else if (path.startsWith("/admin/create")) return "Create new poll";
			else if (path.startsWith("/admin/edit")) return "Edit Poll";
		}
	}
});
</script>

<style scoped>
h1 {
	margin: 30px
}

.sidenav {
	position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    height: 100%;
    background-color: var(--color-background--layer-10);
    z-index: 999;
    overflow-x: hidden;
}

.adminWrapper {
	display: flex;
	flex-direction: row;
}

.slotContainer {
	width: 100%;
	padding-left: var(--sidebar-width);
}

.navList {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0;
	height: 100%;
}

.navItem {
	display: grid;
	transition: opacity var(--transition-short);
}

.icon {
	fill: var(--color-text);
	border-left: 3px solid transparent;
	border-radius: 3px;
	background-color: transparent;
	transition: background-color var(--transition-short), border-left var(--transition-short);
}

.icon:hover {
	background-color: var(--color-background--layer-30);
}

.highlight {
	background-color: var(--color-background--layer-40) !important;
	border-left: 3px solid var(--color-primary--hover);
}

.inactive {
	pointer-events: none;
}

.inactive > .icon {
	fill: var(--color-text--disabled)
}

svg {
	padding: 5px
}

.logout {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 10px;
	cursor: pointer;
}

.sectionHeading {
	display: flex;
	justify-content: center;
	font-size: var(--font-size--heading);
	align-items: center;
}
</style>
