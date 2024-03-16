<template>
  <div>
    <q-card v-for="post in posts" :key="post.id">
      <q-card-section>
        <q-item>
          <q-item-section>
            <q-item-label>{{ post.title }}</q-item-label>
            <q-item-label caption>{{ post.body }}</q-item-label>
            <q-item-label v-for="link in post.links" :key="link.link">
              <a :href="link.link" download>Download File</a>
            </q-item-label>
            <q-item-label>
              <q-chip v-for="role in post.roles" :key="role" :label="role" />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>

    <q-dialog v-model="show" persistent>
      <q-card>
        <q-card-section>
          <h4>Create post</h4>
          <q-input v-model="newPost.title" label="Title" />
          <q-editor
            class="q-mt-sm"
            v-model="newPost.body"
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
            v-model="newPost.roles"
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

          <q-input v-model="linkName" label="Link/File Name" />
          <q-input v-model="link" label="Link/File URL" @keypress.enter="addLink" />
          <q-btn
            class="q-mt-md"
            color="primary"
            label="Add Link"
            @click="addLink"
          />

          <div v-if="newPost.links.length > 0">
            <q-item-label class="q-mt-md"> Links: </q-item-label>
            <q-item v-for="(link, index) in newPost.links" :key="index">
              <q-item-section>
                <q-item-label>{{ link }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  color="red"
                  icon="delete"
                  @click="removeLink(index)"
                />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" color="red" @click="show = false" />
          <q-btn label="Save" color="primary" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-btn
      class="q-mt-md"
      color="primary"
      label="Add Post"
      @click="show = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, computed } from 'vue';
import { usePostStore } from 'src/stores/postStore';
import { useUserStore } from 'src/stores/userStore';
import { Post, RoleEnum, User, DriveLink } from 'src/stores/db/types';
import { Loading } from 'quasar';
import config from 'src/config';

const postStore = usePostStore();
const userStore = useUserStore();

onBeforeMount(async () => {
  //await postStore.getPosts();
  await userStore.getAllUsers();
  roles.value = Object.values(RoleEnum);
  usersRef.value = userStore.users.map((user) => ({ ...user }));
  console.log(usersRef.value);
});

const posts: Post[] = postStore.posts;
const users: User[] = userStore.users;

const postsRef = ref<Post[]>(posts);
const usersRef = ref<User[]>(users);

const newPost = reactive<Post>({
  title: '',
  body: '',
  roles: [],
  users: [],
  links: [],
});

const linkName = ref('');
const link = ref('');

const show = ref(false);

const roles = ref<RoleEnum[]>([]);

const save = async () => {
  Loading.show({
    message: 'Uploading post...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  console.log(newPost);
  //await postStore.addPost(newPost);
  show.value = false;
  await postStore.getPosts();
  postsRef.value = postStore.posts;
  Loading.hide();
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

const addLink = () => {
  if (link.value.trim() !== '' && linkName.value.trim() !== '') {
    newPost.links.push({ name: linkName.value.trim(), link: link.value.trim() });
    link.value = '';
    linkName.value = '';
  }
};


const removeLink = (index: number) => {
  newPost.links.splice(index, 1);
};
</script>
