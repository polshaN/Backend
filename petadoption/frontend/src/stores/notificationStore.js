import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    const adoptions = ref([]);

    const hasNotification = computed(() => {
        return adoptions.value.some(a => ['scheduled', 'pending_request'].includes(a.status));
    });

    const setAdoptions = (newAdoptions) => {
        adoptions.value = newAdoptions;
    };

    return { adoptions, hasNotification, setAdoptions };
});
