<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div class="refresh-container">
		<Button text="Refresh" @click="getAdmins" />
	</div>
	<div class="item-grid">
		<AdminItem
			v-for="admin of admins"
			:key="(admin.id as string)"
			:username="(admin.username as string)"
			:id="(admin.id as string)"
			:isRoot="(admin.isRoot as boolean)"
			:loggedIn="(admin.loggedIn as boolean)"
			:editCallback="makeEdit"
			:deleteCallback="enableDeletion"
		/>
		<AdminItem
			:create-mode="true"
			:createCallback="createCallback"
		/>
	</div>
	<DeleteDialogue
		:deletion="deletion"
		:cancel-callback="cancelDeletion"
		:confirm-callback="confirmDeletion"
	>
		<template #deleteSlot>
			Do you really want to delete "{{ deletionData.username }}" as admin? <br />
			This action is not reversible.
		</template>
	</DeleteDialogue>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			authState: useAuth(),
			admins: [] as Array<Record<string, string | boolean>>,
			deletion: false,
			deletionData: {} as Record<string, string>
		};
	},
	async mounted() {
		await this.getAdmins();
	},
	methods: {
		async getAdmins() {
			await fetch(this.config.public.pollApiBase + "/admin/root/getAdmins", {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				}
			})
				.then(async res => {
					const data = await res.json();
					this.admins = [];
					for (let item in data) {
						this.admins.push({
							username: item,
							...data[item]
						});
					}
				});
		},
		enableDeletion(id: string, username: string) {
			this.deletion = true;
			this.deletionData = {
				id: id,
				username: username
			};
		},
		cancelDeletion() {
			this.deletion = false;
			this.deletionData = {};
		},
		async confirmDeletion() {
			await fetch(this.config.public.pollApiBase + "/admin/root/deleteAdmin", {
				method: "DELETE",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: this.deletionData.id
				})
			});
			this.deletion = false;
			this.deletionData = {};
			this.getAdmins();
		},
		async makeEdit(id: string, username: string, password: string) {
			await fetch(this.config.public.pollApiBase + "/admin/root/editAdmin", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: id,
					username: username,
					password: password
				})
			});
			this.getAdmins();
		},
		async createCallback(username: string, password: string) {
			await fetch(this.config.public.pollApiBase + "/admin/root/createAdmin", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: username,
					password: password
				})
			});
			this.getAdmins();
		}
	}
});
</script>

<style scoped>
.item-grid {
	margin: 40px 0;
	display: flex;
	flex-wrap: wrap;
	justify-content: left; /* todo this looks like shit*/
}

.refresh-container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 10px 0;
}
</style>
