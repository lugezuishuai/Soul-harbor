const databaseVersion = 1; // indexedDB数据库版本

export function getDB() {
  return new Promise(function (resolve) {
    // 打开数据库
    const DBOpenRequest = indexedDB.open('avatar', databaseVersion);

    // 数据库连接成功的回调
    DBOpenRequest.onsuccess = function () {
      console.log('数据库连接成功');
    };

    // 数据库连接失败的回调
    DBOpenRequest.onerror = function () {
      console.error('数据库连接失败');
    };

    // 数据库首次创建版本，或者window.indexedDB.open传递的新版本（版本数值要比现在的高）
    DBOpenRequest.onupgradeneeded = function (event: any) {
      const db = event.target.result;
      if (db.objectStoreNames.contains('avatarTable')) {
        db.deleteObjectStore('avatarTable');
      }
      const objectStore = db.createObjectStore('avatarTable', { autoIncrement: true, keyPath: 'avatarKey' });
      objectStore.createIndex('avatarUrl', 'avatarUrl', { unique: true }); // 用户头像链接
      objectStore.createIndex('avatarData', 'avatarData', { unique: false }); // 用户头像数据

      resolve(db);
    };
  });
}

// 添加数据
export function indexedDBAdd(value: Record<string, any>, key: string, storeName = 'avatarTable') {
  return getDB().then((db: any) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = objectStore.add(value, key);

      request.onerror = function () {
        console.log('数据写入失败');
        reject();
      };

      request.onsuccess = function () {
        console.log('数据写入成功');
        resolve(0);
      };
    });
  });
}

// 删除数据
export function indexedDBDelete(key: string, storeName = 'avatarTable') {
  return getDB().then((db: any) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = objectStore.delete(key);

      request.onerror = function () {
        console.log('数据删除失败');
        reject();
      };

      request.onsuccess = function () {
        console.log('数据删除成功');
        resolve(0);
      };
    });
  });
}

// 查询数据
export function indexedDBRead(key: string, storeName = 'avatarTable') {
  return getDB().then((db: any) => {
    const transaction = db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = objectStore.get(key);

      request.onerror = function () {
        console.log('事务失败');
        reject();
      };

      request.onsuccess = function () {
        if (request.result) {
          resolve(request.result);
        } else {
          console.log('未获得数据记录');
          reject();
        }
      };
    });
  });
}

// 修改数据
export function indexedDBUpdate(key: string, avatarUrl: string, avatarData: string, storeName = 'avatarTable') {
  return getDB().then((db: any) => {
    const transaction = db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = objectStore.get(key);

      request.onerror = function () {
        console.log('事务失败');
        reject();
      };

      request.onsuccess = function (event: any) {
        // 获取我们想要更新的数据
        const data = event.target.result;

        // 更新你想修改的数据
        data.avatarUrl = avatarUrl;
        data.avatarData = avatarData;

        // 把更新过的对象放回数据库
        const requestUpdate = objectStore.put(data);

        requestUpdate.onerror = function () {
          console.error('更新失败');
          reject();
        };
        requestUpdate.onsuccess = function () {
          console.log('更新成功');
          resolve(0);
        };
      };
    });
  });
}
