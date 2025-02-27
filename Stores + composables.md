# Vue Store & Componsables

## Overview

This guide outlines our new architecture for stores and composables, providing a more maintainable, consistent, and robust approach to data management and component interactions.

## Architecture Design

### 1. Store Pattern

All stores now follow this consistent pattern:

- Each API method returns a standardized result object
- Error handling is centralized
- UI concerns (loading, notifications) are removed from stores
- State is kept clean and focused on data

```typescript
// Result interface pattern
export interface StoreResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Example store action
async someAction(param1: string): Promise<StoreResult> {
  try {
    const response = await api.get('/some/endpoint', {
      params: { param1 }
    });
    this.someData = response.data;
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Default error message'
    };
  }
}
```

### 2. Composable Pattern

Composables now act as intermediaries between components and stores:

- Manage loading states
- Handle error notifications
- Provide simplified return values (often boolean success flags)
- Make state accessible via computed properties
- Implement consistent user feedback

```typescript
// Example composable function
const someAction = async (param1: string): Promise<boolean> => {
  loading.value = true;
  try {
    const result = await someStore.someAction(param1);

    if (result.success) {
      NotificationService.success('Operation completed successfully');
      return true;
    } else {
      NotificationService.error(result.error || 'Operation failed');
      return false;
    }
  } catch (error) {
    NotificationService.error('An unexpected error occurred');
    return false;
  } finally {
    loading.value = false;
  }
};
```

## How to Update a Store

1. Add a typed result interface (or use a generic one)
2. Update each method to return a structured response
3. Remove UI-related code (notifications, loading)
4. Maintain state consistently

### Example: Before

```typescript
async fetchData() {
  try {
    Loading.show({ message: 'Loading data...' });
    const response = await api.get('/someEndpoint');
    this.data = response.data;
    Notify.create({
      color: 'positive',
      message: 'Data loaded',
      position: 'bottom',
      icon: 'check',
    });
  } catch (error) {
    Notify.create({
      color: 'negative',
      message: error.response.data.error,
      position: 'bottom',
      icon: 'report_problem',
    });
  } finally {
    Loading.hide();
  }
}
```

### Example: After

```typescript
async fetchData(): Promise<DataResult> {
  try {
    const response = await api.get('/someEndpoint');
    this.data = response.data;
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch data'
    };
  }
}
```

## How to Create a Composable

1. Import the corresponding store
2. Create a loading ref
3. Create computed properties for reactive store data
4. Wrap store methods with error handling and loading state
5. Use NotificationService for user feedback
6. Return simplified response values when possible

### Example:

```typescript
import { ref, computed } from 'vue';
import { useDataStore } from 'src/stores/dataStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';

export function useData() {
  const dataStore = useDataStore();
  const loading = ref(false);

  // Computed properties for reactive store data
  const data = computed(() => dataStore.data);

  const fetchData = async (): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await dataStore.fetchData();

      if (result.success) {
        NotificationService.success('Data loaded successfully');
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to load data');
        return false;
      }
    } catch (error) {
      NotificationService.error('An unexpected error occurred');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    data,
    fetchData
  };
}
```

## How to Update Components

1. Import the composable instead of the store
2. Use the loading state from the composable
3. Call composable methods and handle success/failure
4. Access data via composable's computed properties

### Example: Before

```ts
<script setup>
import { useDataStore } from 'src/stores/dataStore';
import { ref } from 'vue';

const dataStore = useDataStore();
const isLoading = ref(false);

const loadData = async () => {
  isLoading.value = true;
  try {
    await dataStore.fetchData();
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <q-btn @click="loadData" :loading="isLoading">
    Load Data
  </q-btn>
  <div v-for="item in dataStore.data" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### Example: After

```ts
<script setup>
import { useData } from 'src/composables/useData';

const dataComposable = useData();

const loadData = async () => {
  await dataComposable.fetchData();
};
</script>

<template>
  <q-btn @click="loadData" :loading="dataComposable.loading">
    Load Data
  </q-btn>
  <div v-for="item in dataComposable.data" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

## Benefits of This Architecture

1. **Separation of Concerns**
   - Stores handle state and API calls
   - Composables handle UI concerns and error handling
   - Components focus on rendering and user interaction

2. **Improved Testability**
   - Stores can be tested without UI dependencies
   - Composables can be mocked more easily
   - Components have simpler logic

3. **Consistent User Experience**
   - Loading indicators work the same across all features
   - Error notifications follow a standard pattern
   - Success feedback is predictable

4. **Developer Experience**
   - Less boilerplate in components
   - Cleaner, more focused code
   - Better type safety and autocompletion

5. **Maintainability**
   - Easier to debug errors
   - Consistent patterns make the codebase more approachable
   - Changes to notification style or loading behavior can be made in one place

## Best Practices

1. **Use LoadingService for long operations**
   - For short operations, use the `loading` ref
   - For operations that need a custom message, use LoadingService

2. **Be specific with error messages**
   - Provide fallback error messages that make sense
   - In stores, prefer using the server error message when available

3. **Keep composables focused**
   - Each composable should correspond to a specific domain
   - Avoid creating "mega-composables" that do too much

4. **Type everything properly**
   - Use proper TypeScript interfaces for all store results
   - Define types for composable parameters and return values

5. **Use computed properties for reactive store data**
   - Makes it clear which values are reactive
   - Prevents unnecessary re-renders
