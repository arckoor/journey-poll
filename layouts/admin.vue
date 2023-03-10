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
				<li :class="'navItem' + ($route.path.startsWith('/admin/results') ? '' : ' inactive')">
					<SvgResults :class="'icon' + ($route.path.startsWith('/admin/results') ? ' highlight' : '')" />
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
			await navigateTo("/");
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
@media only screen and (max-width: 599px) {
	.sidenav {
		bottom: 0;
		left: 0;
		width: 100%;
		height: fit-content;
		position: fixed;
		flex-direction: row;
		border-radius: 7px 7px 0 0;
	}

	.navList {
		flex-direction: row;
		width: 100%;
	}

	.logout {
		margin-right: 10px;
	}

	ul {
		margin: 5px 0px 0 10px;
	}

	li {
		margin-right: 5px;
	}
}

@media only screen and (min-width: 600px) {
	.sidenav {
		position: fixed;
		top: 0;
		left: 0;
		width: var(--sidebar-width);
		height: 100%;
		flex-direction: column;
		border-radius: 0 7px 7px 0;
	}

	.navList {
		flex-direction: column;
		height: 100%;
	}

	.logout {
		margin-bottom: 10px;
	}
	.slotContainer {
		padding-left: var(--sidebar-width);
	}
}

h1 {
	margin: 30px
}

.sidenav {
    display: flex;
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
}

.navList {
	display: flex;
	align-items: center;
	padding: 0;
}

.navItem {
	display: grid;
	transition: opacity var(--transition-short);
}

.icon {
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
	cursor: pointer;
}

.sectionHeading {
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	font-size: var(--font-size--heading);
}
</style>
