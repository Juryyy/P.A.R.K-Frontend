<template>
  <div>
    <q-btn
      class="q-mt-md"
      color="primary"
      label="Add Post"
      @click="show = true"
      v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')"
    />
    <q-card class="q-my-md post-card" v-for="post in postsRef" :key="post.id" style="border: 6px solid #CBE09D;">
      <q-card-section>
        <q-item>
          <q-item-section>
            <q-item-label class="text-right">
              <q-badge v-if="datesMatch(post.createdAt, post.updatedAt)" color="primary" clickable :label="formatDate(post.createdAt)" />
              <q-badge v-else color="warning" clickable :label="formatDate(post.updatedAt)" />
            </q-item-label>
            <q-item-label class="text-right">
              <q-badge color="orange" v-if="post.author">{{ post.author.firstName }} {{ post.author.lastName }}</q-badge>
            </q-item-label>
            <q-item-label class="text-center text-h5">{{ post.title }}</q-item-label>
            <q-item-label class="text-left">
              <q-chip class="q-mr-xs" size="12px" color="secondary" v-for="role in post.taggedRoles" :key="role" :label="role" />
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label class="q-mb-md content-label">
              <div v-html="post.content" class="q-item-label" caption />
            </q-item-label>
            <q-separator v-if="post.files && post.files.length" />
            <div v-if="post.files && post.files.length" class="align-left">
              <div class="q-mt-xs">
                <q-btn
                  v-for="file in post.files"
                  :key="file.id"
                  color="orange"
                  :label="file.name"
                  :loading="file.id !== undefined ? loadingFiles[file.id] : false"
                  @click="() => file.id !== undefined && downloadFile(file.id, file.name)"
                  class="q-ma-sm file-button"
                  rounded
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
        <div class="align-right">
          <q-btn
            v-if="(user?.role?.includes('Office') || user?.role?.includes('Developer')) && post.id"
            color="negative"
            icon="delete"
            @click="deletePost(post.id)"
            class="q-mt-md"
            size="md"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="show" persistent>
      <q-card>
        <q-card-section>
          <h4>Create post</h4>
          <q-input v-model="newPost.title" label="Title" />
          <q-editor
            class="q-mt-sm"
            v-model="newPost.content"
            label="Content"
            :toolbar="[
              [
                'bold',
                'italic',
                'strike',
                'link',
                'underline',
                'subscript',
                'superscript',
              ],
              ['unordered', 'ordered'],
              [
                {
                  label: $q.lang.editor.align,
                  icon: $q.iconSet.editor.align,
                  fixedLabel: true,
                  list: 'only-icons',
                  options: ['left', 'center', 'right', 'justify'],
                },
              ],
            ]"
          />
          <q-select
            v-model="newPost.taggedRoles"
            label="Roles"
            multiple
            use-chips
            :options="roles"
            clearable
            use-input
          />
          <q-select
            clearable
            v-model="newPost.users"
            label="Users"
            multiple
            use-chips
            :options="userOptions"
            use-input
            input-debounce="300"
            @filter="filter"
          />
          <q-file
            type="file"
            label="Upload Files"
            v-model="selectedFiles"
            multiple
            @change="onFileChange"
          />
          <div v-if="selectedFiles.length > 0" class="q-mt-md">
            <q-chip
              v-for="(file, index) in selectedFiles"
              :key="index"
              :label="file.name"
              removable
              @remove="removeFile(index)"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" color="red" @click="show = false" />
          <q-btn label="Save" color="primary" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, computed } from 'vue';
import { usePostStore } from 'src/stores/postStore';
import { useUserStore } from 'src/stores/userStore';
import { Post, RoleEnum, User } from 'src/db/types';
import { Loading, Notify } from 'quasar';

const postStore = usePostStore();
const userStore = useUserStore();

const user = userStore.user;
const { users } = useUserStore();
const posts = postStore.posts;

const postsRef = ref(posts);
const usersRef = ref<User[]>(users);
const loadingFiles = reactive<{ [key: number]: boolean }>({});

onBeforeMount(async () => {
  roles.value = Object.values(RoleEnum);
  usersRef.value = userStore.users.map((user) => ({ ...user }));
  console.log(usersRef.value);
  console.log(postStore.posts);
});

const newPost = reactive<Post>({
  title: '',
  content: '',
  taggedRoles: [],
  users: [],
});

const selectedFiles = ref<File[]>([]);
const show = ref(false);
const roles = ref<RoleEnum[]>([]);

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files);
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const save = async () => {
  Loading.show({
    message: 'Uploading post...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });

  const formData = new FormData();
  formData.append('title', newPost.title);
  formData.append('content', newPost.content);
  formData.append('roles', JSON.stringify(newPost.taggedRoles));
  formData.append('users', JSON.stringify(newPost.users));

  selectedFiles.value.forEach((file, index) => {
    formData.append('files', file, file.name);
  });

  try {
    await postStore.addPost(formData);
    show.value = false;
    await postStore.getPosts();
    postsRef.value = postStore.posts;
  } catch (error) {
    Notify.create({
      message: 'Failed to upload post',
      color: 'negative',
    });
  } finally {
    Loading.hide();
  }
};

const deletePost = async (postId: number) => {
  Loading.show({
    message: 'Deleting post...',
    spinnerColor: 'red',
    messageColor: 'red',
    backgroundColor: 'black',
  });

  try {
    await postStore.deletePost(postId);
    await postStore.getPosts();
    postsRef.value = postStore.posts;
  }
    finally {
    Loading.hide();
  }
};

const downloadFile = async (fileId: number, fileName: string) => {
  loadingFiles[fileId] = true;
  try {
    await postStore.downloadFile(fileId, fileName);
  } finally {
    loadingFiles[fileId] = false;
  }
};

const formatDate = (date: Date | undefined) => {
  return date ? new Date(date).toLocaleDateString('en-US') : '';
};

const userOptions = computed(() => {
  return userStore.users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
  }));
});

type UpdateFunction = (callback: () => void) => void;

const filterFn = (val: string, update: UpdateFunction) => {
  if (val === '') {
    update(() => {
      usersRef.value = userStore.users.map((user) => ({ ...user }));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    usersRef.value = userStore.users.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(needle)
    );
  });
};

const filter = (value: string, update: UpdateFunction) => {
  filterFn(value, update);
};

const datesMatch = (date1: Date | undefined, date2: Date | undefined) => {
  if (!date1 || !date2) {
    return false;
  }
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};
</script>

<style scoped>
.q-card-section {
  padding: 16px;
}

.file-button {
  display: block;
  width: 100%;
  text-align: left;
}

.align-left {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.align-right {
  text-align: right;
}

.post-card {
  width: 80%;
  max-width: 550px;
}

@media (min-width: 600px) {
  .post-card {
    width: 600px;
  }
}

.content-label {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
