<template>
	<Title>Journey Polls - ADMIN</Title>
	<div class="adminWrapper">
		<div class="sidenav">
			<ul class="navList">
				<li class="navItem">
					<NuxtLink href="/admin/list">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 48 48"
							height="34"
							width="34"
							:class="'icon' + ($route.path === '/admin/list' ? ' highlight' : '')"
						>
							<path d="M8.55 39q-1.05 0-1.8-.725T6 36.55q0-1.05.75-1.8t1.8-.75q1 0 1.725.75.725.75.725 1.8 0 1-.725 1.725Q9.55 39 8.55 39ZM16 38v-3h26v3ZM8.55 26.5q-1.05 0-1.8-.725T6 24q0-1.05.75-1.775.75-.725 1.8-.725 1 0 1.725.75Q11 23 11 24t-.725 1.75q-.725.75-1.725.75Zm7.45-1v-3h26v3ZM8.5 14q-1.05 0-1.775-.725Q6 12.55 6 11.5q0-1.05.725-1.775Q7.45 9 8.5 9q1.05 0 1.775.725Q11 10.45 11 11.5q0 1.05-.725 1.775Q9.55 14 8.5 14Zm7.5-1v-3h26v3Z"/>
						</svg>
					</NuxtLink>
				</li>
				<li class="navItem">
					<NuxtLink to="/admin/create">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 48 48"
							height="34"
							width="34"
							:class="'icon' + ($route.path === '/admin/create' ? ' highlight' : '')"
						>
							<path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z"/>
						</svg>
					</NuxtLink>
				</li>
				<li :class="'navItem' + ($route.fullPath.startsWith('/admin/edit') ? '' : ' inactive')">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						height="34"
						width="34"
						:class="'icon' + ($route.path.startsWith('/admin/edit') ? ' highlight' : '')"
					>
						<path d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.1-.85t2.1.85l2.2 2.2q.85.85.85 2.1t-.85 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2Zm-5.35-1.05-1.1-1.1 2.2 2.2Z"/>
					</svg>
				</li>
			</ul>
			<div @click="logout" class="logout">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 48 48"
					height="34"
					width="34"
					class="icon"
				>
					<path d="M9 42q-1.2 0-2.1-.9Q6 40.2 6 39V9q0-1.2.9-2.1Q7.8 6 9 6h14.55v3H9v30h14.55v3Zm24.3-9.25-2.15-2.15 5.1-5.1h-17.5v-3h17.4l-5.1-5.1 2.15-2.15 8.8 8.8Z"/>
				</svg>
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
			await fetch(this.config.public.apiBase + "/admin/logout", {
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
.sidenav {
	position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    height: 100vh;
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
	transition: background-color var(--hover-transition), border-left var(--hover-transition);
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
	font-size: 50px;
	align-items: center;
}
</style>
