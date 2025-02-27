<template>
  <div class="post-container q-pa-md">
    <q-input
      v-model="searchQuery"
      label="Search posts"
      class="q-mb-md"
      clearable
      debounce="100"
    >
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-btn
      class="add-post-btn q-mb-md"
      color="primary"
      label="Add Post"
      @click="show = true"
      v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')"
    />
    <div v-if="filteredPosts.length !==0">
  <q-card  v-for="post in filteredPosts" :key="post.id" class="post-card q-mb-lg">
    <div v-if="post.id">
      <q-card-section v-if="!editingPost[post.id]">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-h6">{{ post.title }}</div>
          <div>
            <q-badge v-if="datesMatch(post.createdAt, post.updatedAt)" color="primary" class="q-mr-sm">
              {{ formatDate(post.createdAt) }}
            </q-badge>
            <q-badge v-else color="warning">
              {{ formatDate(post.updatedAt) }}
            </q-badge>
          </div>
        </div>

        <div class="row items-center q-mb-sm">
          <q-avatar size="35px" v-if="post.author && post.author.avatarData">
            <img :src="post.author.avatarData" />
          </q-avatar>
          <q-avatar color="orange" text-color="black" size="35px" v-else>
            {{ post.author ? post.author.firstName[0] + post.author.lastName[0] : '' }}
          </q-avatar>
          <span class="q-ml-sm text-weight-bold">{{ post.author ? `${post.author.firstName} ${post.author.lastName}` : '' }}</span>
        </div>

        <div class="q-mb-md role-chips">
          <q-chip v-for="role in post.taggedRoles" :key="role" color="secondary" text-color="black" class="q-mr-xs role-chip">
            {{ role }}
          </q-chip>
        </div>

        <q-separator class="q-my-md" />

        <div v-html="post.content" class="post-content q-mb-md"></div>
        <q-separator/>
        <div v-if="post.files && post.files.length" class="q-mt-md">
          <div v-for="file in post.files" :key="file.id" class="q-mt-sm file-item">
            <q-icon :name="getFileIcon(file.name)" size="24px" class="q-mr-sm" />
            <span class="file-name">{{ file.name }}</span>
            <q-btn
              flat
              dense
              round
              icon="download"
              @click="() => file.id !== undefined && downloadFile(file.id, file.name)"
              :loading="file.id !== undefined ? loadingFiles[file.id] : false"
            >
              <template v-slot:loading>
                <q-spinner size="20px" />
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-section v-else>
        <!-- Edit mode -->
        <q-input v-model="editedPost.title" label="Title" class="q-mb-md" />
        <q-editor
          v-model="editedPost.content"
          :toolbar="[
            ['bold', 'italic', 'strike', 'link', 'underline', 'subscript', 'superscript'],
            ['unordered', 'ordered'],
            [{
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify'],
            }],
          ]"
          class="q-mb-md"
        />
        <q-select
          v-model="editedPost.taggedRoles"
          label="Roles"
          multiple
          use-chips
          :options="filteredRoles"
          clearable
          use-input
          input-debounce="0"
          @filter="filterRoles"
          class="q-mb-md"
        />
        <q-select
          v-model="editedPost.users"
          label="Users"
          multiple
          use-chips
          :options="filteredUsers"
          use-input
          input-debounce="0"
          @filter="filterUsers"
          option-value="id"
          option-label="firstName"
          class="q-mb-md"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.firstName }} {{ scope.opt.lastName }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div v-if="post.files && post.files.length" class="q-mt-md">
          <div v-for="file in post.files" :key="file.id" class="q-mt-sm file-item">
            <div v-if="file.id">
            <q-icon :name="getFileIcon(file.name)" size="24px" class="q-mr-sm" />
            <span class="file-name">{{ file.name }}</span>
            <q-btn
              flat
              dense
              round
              icon="delete"
              @click="removeExistingFile(post.id, file.id)"
            />
          </div>
          </div>
        </div>
        <q-file
          type="file"
          label="Add Files"
          v-model="selectedFiles"
          multiple
          @update:model-value="(files) => onEditFileChange(files, post.id)"
          class="q-mb-md"
        />
        <div v-if="editFileUploads[post.id] && editFileUploads[post.id].length > 0" class="q-mt-md">
          <div v-for="(file, index) in editFileUploads[post.id]" :key="index" class="q-mt-sm file-item">
            <q-icon :name="getFileIcon(file.name)" size="24px" class="q-mr-sm" />
            <span class="file-name">{{ file.name }}</span>
            <q-btn
              flat
              dense
              round
              icon="close"
              @click="removeEditFile(post.id, index)"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <template v-if="!editingPost[post.id]">
          <q-btn
            v-if="user?.id === post.authorId"
            color="primary"
            icon="edit"
            @click="startEditing(post)"
            flat
            round
          />
          <q-btn
            v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')"
            color="negative"
            icon="delete"
            @click="deletePost(post.id)"
            flat
            round
          />
        </template>
        <template v-else>
          <q-btn
            color="primary"
            label="Save"
            @click="saveEdit(post.id)"
            flat
          />
          <q-btn
            color="negative"
            label="Cancel"
            @click="cancelEdit(post.id)"
            flat
          />
        </template>
      </q-card-actions>
    </div>
    </q-card>
    </div>


    <q-dialog v-model="show" persistent>
      <q-card class="post-card-create">
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
          v-model="selectedFiles"
          type="file"
          label="Upload Files"
          multiple
          @update:model-value="onFileChange"
          class="q-mb-md"
        >
        <q-tooltip class="bg-secondary">You can select multiple files at once. Hold Ctrl/Cmd to select individual files or Shift for a range.</q-tooltip>
        </q-file>
            <div v-if="selectedFiles.length > 0" class="q-mt-md">
              <div v-for="(file, index) in selectedFiles" :key="index" class="q-mt-sm file-item">
                <q-icon :name="getFileIcon(file.name)" size="24px" class="q-mr-sm" />
                <span class="file-name">{{ file.name }}</span>
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  @click="removeFile(index)"
                />
              </div>
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
import { ref, reactive, onBeforeMount, computed} from 'vue';
import { Post, RoleEnum, User } from 'src/db/types';
import { Loading, Notify, Dialog } from 'quasar';
import { getFileIcon } from 'src/helpers/FileType';
import { useUser } from 'src/composables/useUser';
import { usePost } from 'src/composables/usePost';
import { NotificationService } from 'src/utils/services/notificationService';

const user = useUser().user;
const users = useUser().users
const posts = ref(usePost().posts);

const usersRef = ref<User[]>(users);
const loadingFiles = reactive<{ [key: number]: boolean }>({});
const editingPost = reactive<{ [key: number]: boolean }>({});
const editedPost = reactive<Post>({
  id: 0,
  title: '',
  content: '',
  taggedRoles: [],
  users: [],
});

const searchQuery = ref('');
const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value;

  const query = searchQuery.value.toLowerCase();
  return posts.value.filter((post) =>
    (post.title ?? '').toLowerCase().includes(query) ||
    (post.content ?? '').toLowerCase().includes(query) ||
    (post.taggedRoles ?? []).some(role => (role ?? '').toLowerCase().includes(query))
  );
});

const editFileUploads = reactive<{ [key: number]: File[] }>({});

onBeforeMount(async () => {
  roles.value = Object.values(RoleEnum);
  usersRef.value = useUser().users.map((user) => ({ ...user }));
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

const filteredRoles = ref<RoleEnum[]>([]);
const filteredUsers = ref<User[]>([]);

const filterRoles = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredRoles.value = roles.value;
    } else {
      const needle = val.toLowerCase();
      filteredRoles.value = roles.value.filter(v => v.toLowerCase().includes(needle));
    }
  });
};

const filterUsers = (val: string, update: (callback: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredUsers.value = usersRef.value;
    } else {
      const needle = val.toLowerCase();
      filteredUsers.value = usersRef.value.filter(
        user => `${user.firstName} ${user.lastName}`.toLowerCase().includes(needle)
      );
    }
  });
};

const onFileChange = (files: FileList | null) => {
  if (files) {
    selectedFiles.value = Array.from(files);
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const save = async () => {
  if (!newPost.title || !newPost.content) {
    NotificationService.error('Title and content are required');
    return;
  }

  const formData = new FormData();
  formData.append('title', newPost.title);
  formData.append('content', newPost.content);

  const roles = Array.isArray(newPost.taggedRoles) ? newPost.taggedRoles : [];
  formData.append('roles', JSON.stringify(roles));

  const users = Array.isArray(newPost.users) ? newPost.users : [];
  formData.append('users', JSON.stringify(users));

  selectedFiles.value.forEach((file) => {
    formData.append('files', file);
  });

  await usePost().addPost(formData);
  show.value = false;
  await usePost().getPosts();
  posts.value.splice(0, posts.value.length, ...usePost().posts.value);
  newPost.title = '';
  newPost.content = '';
  newPost.taggedRoles = [];
  newPost.users = [];
  selectedFiles.value = [];
};

const deletePost = async (postId: number) => {
  Dialog.create({
    title: 'Delete post',
    message: 'Are you sure you want to delete this post? This action cannot be undone.',
    ok: {
      label: 'Yes',
      color: 'negative',
    },
    cancel: {
      label: 'No',
      color: 'primary',
    },
  }).onOk(async () => {
    await usePost().deletePost(postId);
    await usePost().getPosts();
    posts.value.splice(0, posts.value.length, ...usePost().posts.value);
  });
};

const downloadFile = async (fileId: number, fileName: string) => {
  loadingFiles[fileId] = true;
  try {
    await usePost().downloadFile(fileId, fileName);
  } finally {
    loadingFiles[fileId] = false;
  }
};

const formatDate = (date: Date | undefined) => {
  return date ? new Date(date).toLocaleDateString('en-US') : '';
};

const userOptions = computed(() => {
  return useUser().users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
  }));
});

type UpdateFunction = (callback: () => void) => void;

const filterFn = (val: string, update: UpdateFunction) => {
  if (val === '') {
    update(() => {
      usersRef.value = useUser().users.map((user) => ({ ...user }));
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    usersRef.value = useUser().users.filter((user) =>
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

const startEditing = (post: Post) => {
  if (post.id !== undefined) {
    editedPost.id = post.id;
    editedPost.title = post.title;
    editedPost.content = post.content;
    editedPost.taggedRoles = Array.isArray(post.taggedRoles) ? [...post.taggedRoles] : [];
    editedPost.users = Array.isArray(post.users) ? [...post.users] : [];
    editingPost[post.id] = true;
    editFileUploads[post.id] = [];
  }
};

const cancelEdit = (postId: number | undefined) => {
  if (postId !== undefined) {
    editingPost[postId] = false;
    editFileUploads[postId] = [];
  }
};

const onEditFileChange = (files: FileList | null, postId: number | undefined) => {
  if (files && postId !== undefined) {
    editFileUploads[postId] = [...(editFileUploads[postId] || []), ...Array.from(files)];
  }
};

const removeEditFile = (postId: number, index: number) => {
  editFileUploads[postId].splice(index, 1);
};

const removeExistingFile = (postId: number | undefined, fileId: number) => {
  if (postId !== undefined) {
    const post = posts.value.find(p => p.id === postId);
    if (post && post.files) {
      post.files = post.files.filter(f => f.id !== fileId);
    }
  }
};

const saveEdit = async (postId: number | undefined) => {
  if (postId === undefined){
    NotificationService.error('Could not find post to edit');
    return;
  }
  cancelEdit(postId);
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

.post-container {
  max-width: 800px;
  margin: 0 auto;
}


.add-post-btn {
  width: 100%;
}

.post-card {
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.3s ease-in-out;
}

.post-card:hover {
  box-shadow: 0 5px 5px -3px rgba(20, 187, 62, 0.2), 0 8px 10px 1px rgba(20, 187, 62, 0.14), 0 3px 14px 2px rgba(20, 187, 62, 0.12);
}

.post-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

@media (max-width: 600px) {
  .post-container {
    padding: 8px;
  }

  .post-card {
    border-radius: 0;
  }
}

.post-card-create {
  width: 80%;
  max-width: 550px;
}

@media (min-width: 600px) {
  .post-card-create {
    width: 600px;
  }
}

.post-container-create {
  max-width: 800px;
  margin: 0 auto;
}


.post-card-create {
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.3s ease-in-out;
}

.content-label {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
}

.role-chip {
  font-size: 12px;
  height: 24px;
  padding: 0 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  max-width: 100%;
  background-color: rgba(0, 0, 0, 0.03);
  margin-bottom: 8px;
}

.file-name {
  flex-grow: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
