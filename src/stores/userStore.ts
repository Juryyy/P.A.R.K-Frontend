import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { UserInfo, User } from '../db/types';
import { ref } from 'vue';
import { Notify } from 'quasar';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref({} as UserInfo),
    usersExams: ref([]),
    userAvatar: ref(''),
    selectedUser: ref(),
    selectedUserAvatar: ref(''),
    users : ref([] as User[]),
  }),
  actions: {
    async updateUserInfo(userInfo: UserInfo) {
      // Add update user info on backend
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        if (key === 'role' && Array.isArray(value)) {
          localStorage.setItem(key, JSON.stringify(value)); // Serialize array
        } else {
          localStorage.setItem(key, String(value));
        }
      }
    },

    getUserInfo() {
      const user = {} as UserInfo;
      user.id = Number(localStorage.getItem('id'));
      user.email = localStorage.getItem('email');
      user.firstName = localStorage.getItem('firstName');
      user.lastName = localStorage.getItem('lastName');
      user.drivingLicense = localStorage.getItem('drivingLicense') === 'true';
      user.note = localStorage.getItem('note');
      user.adminNote = localStorage.getItem('adminNote');

      // Deserialize the roles array
      const roles = localStorage.getItem('role');
      user.role = roles ? JSON.parse(roles) : [];

      user.avatarUrl = localStorage.getItem('avatarUrl');
      user.activatedAccount = localStorage.getItem('activatedAccount') === 'true';
      user.deactivated = localStorage.getItem('deactivated') === 'true';
      user.dateOfBirth = localStorage.getItem('dateOfBirth');
      user.isSenior = localStorage.getItem('isSenior') === 'true';
      user.phone = localStorage.getItem('phone');

      this.user = user;
      return this.user;
    },

    getUserRole() {
      const roles = localStorage.getItem('role');
      return roles ? JSON.parse(roles) : [];
    },

    getUserId() {
      return localStorage.getItem('id');
    },

    async getUsersExams() {
      try {
        const response = await api.get('/users/usersExams');
        this.usersExams = response.data;
      } catch (error) {
        Notify.create({
          message: 'Error getting users exams',
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getUsersAvatar() {
      try {
        const response = await api.get('static/images/avatar', {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'image/jpeg',
          },
        });
        const uint8Array = new Uint8Array(response.data);
        const arrayBuffer = uint8Array.buffer;
        const array = Array.from(new Uint8Array(arrayBuffer));
        const base64String = btoa(String.fromCharCode.apply(null, array));

        this.userAvatar = `data:image/jpeg;base64,${base64String}`;
      } catch (error) {
        Notify.create({
          message: 'Error loading avatar',
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getProfile(userId: number) {
      try {
        const response = await api.get(`/users/profile/${userId}`);
        this.selectedUser = response.data;
      } catch (error) {
        Notify.create({
          message: 'Error loading profile',
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getUserAvatarById(userId: number) {
      try {
        const response = await api.get(`static/images/${userId}`, {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'image/jpeg',
          },
        });
        const uint8Array = new Uint8Array(response.data);
        const arrayBuffer = uint8Array.buffer;
        const array = Array.from(new Uint8Array(arrayBuffer));
        const base64String = btoa(String.fromCharCode.apply(null, array));

        this.selectedUserAvatar = `data:image/jpeg;base64,${base64String}`;
      } catch (error) {
        Notify.create({
          message: 'Error loading avatar',
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getAllUsers() {
      try {
        const response = await api.get('/users/allUsers');
        this.users = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting users',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async fetchUserInfo(){
      try {
        const response = await api.get('/users/userInfo');
        this.updateUserInfo(response.data);
        this.user = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error fetching user info',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updateProfile(id: number, email: string, firstName: string, lastName: string, dateOfBirth : string, note : string | null, noteLonger : string | null, drivingLicense : boolean, phone : string | null) {
      try {
      await api.put('/users/update', {
        id,
        email,
        firstName,
        lastName,
        dateOfBirth,
        note,
        noteLonger,
        drivingLicense,
        phone,
      });
      Notify.create({
        color: 'positive',
        message: 'Profile updated',
        position: 'bottom',
        icon: 'check',
        closeBtn: 'X',
        textColor: 'black',
      });
      }
      catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error updating user',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
   },

   async updateAdminNote (id: number, adminNote: string | null) {
    try {
      await api.put('/users/updateAdminNote', {
        id,
        adminNote,
      });
      Notify.create({
        color: 'positive',
        message: 'Admin note updated',
        position: 'bottom',
        icon: 'check',
        closeBtn: 'X',
        textColor: 'black',
      });
    } catch (error) {
      Notify.create({
        color: 'negative',
        message: 'Error updating admin note',
        position: 'bottom',
        icon: 'report_problem',
      });
    }
  },

    clearSelectedUserInfo() {
      this.selectedUser = undefined;
      this.selectedUserAvatar = '';
    }
  }

});
