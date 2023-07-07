const express = require('express');
const app = express();
const aClient = require('request-promise');
const request = require('request');
let MD5 = require('crypto-js/md5');
const moment = require('moment');

const faceImage = require('./imageData');

app.use(express.json()); // 解析JSON格式的主體
app.use(express.urlencoded({ extended: true })); // 解析urlencoded格式的主體

//////////////////////////////////
const headers = {
  'content-type': 'application/json',
  Authorization:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5OGYzN2I0NS02YjgyLTQ2MjctYWNlYi04MjRlZDZiZTk2NDMiLCJqdGkiOiJhYTcwN2VlNzhjY2RmY2Q4MzhiYjIzZmVmY2VmMDVmNWVhYTkzMGI5M2RkZTNlNmQzYTM4MGQ2ODY3MTk5MThjY2I2NTJiZjAyNDBiNzZkNyIsImlhdCI6MTY4Mzc4MjQ3Ny4zNzYyNDksIm5iZiI6MTY4Mzc4MjQ3Ny4zNzYyNTMsImV4cCI6MTY4Mzg2ODg3Ny4zNDkyOTMsInN1YiI6IiIsInNjb3BlcyI6WyIqIl19.h6iEemVyn4CpqyM0f2Ezf_hk-DZkBw102w0Dc5rg8mWjqOq22vEuI-eQDvohk3AIPYdJoi7KIgl1u8VhP0tH5LUVZxhrfMEfcb8so_JEnxx4qgUJT85Q7yt11ytJbUkZCZX_GJkibq2lEFzcPvGV8OL75civRbmKJJxg3rCm2LF78hHdkQgT5z9XhdP6YuR1SNF6NBpB3YePP5SWHl920j4l-5aIE5wFd-kGzOM8vh5XqF-zh7FqBi_EIuK4E2VMKPdazLTDKZiq7c9aPqsuSLKvjIjQ_vS2qAcNMIni3W2u4SopO_-lc8B6T5iKE5nABJwKHOwDyIaXclft3EL5e0sz4choVrH0ce_AsxQlDY06ECF02nN_Si-GqEXI7Miyk-rDabgOv90ZClsC000Gpzgq5kFBj-sWRWb4cqWn-VQ4Q5E4QQ2hTgLjqPZirNq_PdlSx8-jRGUCNt5q8aH7MmR4dZxJbZbhLOlMLJdh_Ea4bqnXjOoFGQDTpFdCsfbQCWkm1OQvpOmBCjhASWvRhKUifRuD0CoSoLLBMALHF_DipP88RRT_Cng_RzK7S4h6Rzl3-BP3pf_7i1kTc-o8TRtz8_snv4DpIssvadAi_6idr-Za5pVWto1oU4kEIcJT6RqYMClmc7K8FcVINbY4bNoCZUAVnGLW-MyrS8XWSVU',
};

const data = [
  {
    photo:
      'data:image/png;base64,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',
  },
];

async function getTonnetServiceToken(
  host,
  port,
  client_t_credentials,
  client_secret
) {
  try {
    if (!host || !port || !client_t_credentials || !client_secret) {
      throw new Error('Missing parameter(s) in getTonnetServiceToken function');
    }
    if (
      typeof host !== 'string' ||
      typeof port !== 'string' ||
      typeof client_t_credentials !== 'string' ||
      typeof client_secret !== 'string'
    ) {
      throw new Error(
        'Invalid parameter type(s) in getTonnetServiceToken function'
      );
    }

    const response = await aClient({
      method: 'POST',
      url: `https://${host}:${port}/oauth/token`,
      json: true,
      body: {
        grant_type: 'client_credentials',
        client_id: client_t_credentials,
        client_secret: client_secret,
        scope: '*',
      },
      rejectUnauthorized: false,
    });

    return response.access_token;
  } catch (err) {
    console.log('getTonnetServiceToken error'.err);
  }
}

async function tonnetServerSync(
  tonnetServerHost,
  tonnetServerPort,
  pass,
  headers
) {
  function getDevicesGroupNumArr(num) {
    const result = [];
    let exponent = 0;

    while (num > 0) {
      if (num & 1) {
        result.push(exponent + 1);
      }
      num >>= 1;
      exponent++;
    }

    return result;
  }
  const devicesGroupNumArr = getDevicesGroupNumArr(pass);

  const allDevices = await aClient({
    method: 'GET',
    url: `https://${tonnetServerHost}:${tonnetServerPort}/api/v2/device/list`,
    json: true,
    headers: headers,
    rejectUnauthorized: false,
  });

  const devicesIdMatchDevicesGroupNumAndIsFaceDetectorArr = allDevices
    .filter((device) => {
      return (
        devicesGroupNumArr.includes(device.group_num) && device.dev_type === 3
      );
    })
    .map((item) => Number(item.dev_id));

  if (devicesIdMatchDevicesGroupNumAndIsFaceDetectorArr.length === 0) {
    console.log(
      'tonnethelper uploadFace devicesIdMatchDevicesGroupNumAndIsFaceDetectorArr = 0'
    );
    return;
  }

  await aClient({
    method: 'POST',
    url: `https://${tonnetServerHost}:${tonnetServerPort}/api/system/sync`,
    json: true,
    headers: headers,
    body: {
      dev_type: 3,
      dev_id: devicesIdMatchDevicesGroupNumAndIsFaceDetectorArr,
    },
    rejectUnauthorized: false,
  });

  console.log('tonnethelper uploadFace success');
}

app.get('/api/uploadFace', async (req, res) => {
  try {
    const [tonnetServerHost, tonnetServerPort] = ['192.168.200.3', '8443'];
    const tonnetclient_id = '98f37b45-6b82-4627-aceb-824ed6be9643';
    const tonnetclient_secret = 's2soPagg9FdxsPVt0OaprlFXFmYf4qnKO83d2RzB';
    const visitorName = '20230705';

    const token = await getTonnetServiceToken(
      tonnetServerHost,
      tonnetServerPort,
      tonnetclient_id,
      tonnetclient_secret
    );

    if (token === null || token == undefined) {
      console.log('tonnethelper uploadFace get tonnet token error');
      return;
    }

    const thisHeaders = {
      Authorization: token,
    };

    // 物業只能傳訪客姓名 由通航server利用此訪客姓名找到member_id才可使用更新人臉API
    const memberListArr = await aClient({
      method: 'GET',
      url: `https://${tonnetServerHost}:${tonnetServerPort}/api/v2/member/list`,
      json: true,
      headers: thisHeaders,
      rejectUnauthorized: false,
    });

    const visitorMemberIDObj = memberListArr.find((obj) => {
      return obj.name === visitorName;
    });

    const visitorMemberID = visitorMemberIDObj
      ? visitorMemberIDObj.member_id
      : null;
    const visitorPass = visitorMemberIDObj
      ? Number(visitorMemberIDObj.pass)
      : null;

    if (visitorMemberID !== null && visitorPass !== null) {
      // 新增此訪客相片
      await aClient({
        method: 'POST',
        url: `https://${tonnetServerHost}:${tonnetServerPort}/api/v2/member/${visitorMemberID}/face`,
        json: true,
        body: [
          {
            photo: faceImage,
          },
        ],
        headers: thisHeaders,
        rejectUnauthorized: false,
      });

      // 新增照片後需要進行同步 但進行同步前需要取得該訪客允許進入的人臉機 dev_id才可打同步API
      await tonnetServerSync(
        tonnetServerHost,
        tonnetServerPort,
        visitorPass,
        thisHeaders
      );

      res.send('tonnet uploadFace success');
    } else {
      console.log(
        'tonnethelper uploadFace get visitorMemberID or visitorPass error'
      );
      return;
    }
  } catch (error) {
    console.log('tonnethelper uploadFace error:', error);
  }
});

app.get('/api/uploadGuest', async (req, res) => {
  try {
    const [tonnetServerHost, tonnetServerPort] = ['192.168.0.251', '8443'];
    const tonnetclient_id = '98f37b45-6b82-4627-aceb-824ed6be9643';
    const tonnetclient_secret = 's2soPagg9FdxsPVt0OaprlFXFmYf4qnKO83d2RzB';
    const token = await getTonnetServiceToken(
      tonnetServerHost,
      tonnetServerPort,
      tonnetclient_id,
      tonnetclient_secret
    );
    const thisHeaders = {
      Authorization: token,
    };

    const doorGroupResult = await aClient({
      method: 'GET',
      url: `https://${tonnetServerHost}:${tonnetServerPort}/api/v2/door_group/list`,
      json: true,
      headers: thisHeaders,
      rejectUnauthorized: false,
    });

    // 之後物業addVisitorBa要新增參數 '群組名稱'
    const guestPassArr = doorGroupResult
      .filter((item) => item.group_name === '112號小門口機')
      .map((item) => Number(item.pass));
    if (guestPassArr.length === 0) {
      console.log('==tonnet 伺服器找不到此用戶通行群組名稱:', '112號小門口機');
      return;
    }

    await aClient({
      method: 'POST',
      url: `https://${tonnetServerHost}:${tonnetServerPort}/api/v2/member`,
      json: true,
      headers: thisHeaders,
      body: [
        {
          member_id: moment().valueOf(),
          name: '20230705',
          group_index: null,
          time_group_index: null,
          pass: guestPassArr[0],
          password: 'Nzc=',
          nickname: '20230705',
          effective: '2023-07-05T13:00:00+0800',
          expired: '2099-12-31T00:00:00+0800',
          floors: [],
          data: null,
        },
      ],
      rejectUnauthorized: false,
    });

    // 通航設備只要新增人員或相片就要做一次同步到人臉機 但要先拿到該訪客可通行的人臉機的dev_id
    // 先將此筆訪客人員的pass轉換成所屬的設備群組 例如 pass = 3 => 2 = 2的0次方 + 2的1次方 => [0,1]表示設備群組1(group_num =1)和設備群組2(group_num =2)
    // 設備群組1和設備群組2 再查詢所有設備資料找出group_num符合且是人臉機的設備
    await tonnetServerSync(
      tonnetServerHost,
      tonnetServerPort,
      guestPassArr[0],
      thisHeaders
    );

    res.send('tonnet uploadGuest success');
  } catch (err) {
    console.log(err);
  }
  res.send('api/uploadGuest');
});

app.get('/api/setSecurity', async (req, res) => {
  try {
    const nowTime = moment();
    const mode = 1;
    const room = '010101';

    const token = await getTonnetServiceToken();
    const thisheaders = {
      'content-type': 'application/json',
      Authorization: token,
    };
    const thisBody = {
      mode: mode,
      token: MD5(
        `remote${nowTime.format('YYYYMMDD')}${room}${nowTime.format('HHmmss')}`
      ).toString(),
      room: room,
      time: nowTime.format(),
    };

    await aClient({
      method: 'POST',
      url: `https://192.168.0.251:8443/api/v2/remote/security/12`,
      json: true,
      headers: thisheaders,
      body: thisBody,
      rejectUnauthorized: false,
    });
  } catch (err) {
    console.log(err);
  }

  console.log('run here2');
  res.send('api/setSecurity');
});

app.get('/api/opendoorByCenter', async (req, res) => {
  try {
    const nowTime = moment();
    const token = await getTonnetServiceToken();
    const relayTime = 10;
    const devID = 16;
    const room = '010109';

    const thisHeaders = {
      Authorization: token,
    };

    const thisBody = {
      token: MD5(
        `remote${nowTime.format('YYYYMMDD')}${room}${nowTime.format('HHmmss')}`
      ).toString(),
      room: room,
      time: nowTime.format(),
      relay_time: relayTime,
    };

    const response = await aClient({
      method: 'POST',
      url: `https://192.168.0.251:8443/api/v2/remote/opendoor/${devID}`,
      json: true,
      body: thisBody,
      headers: thisHeaders,
      rejectUnauthorized: false,
    });
  } catch (err) {
    console.log(err);
  }
  res.send(`open door success`);
});

app.get('/api/opendoor', async (req, res) => {
  try {
    const nowTime = moment();
    const response = await aClient({
      method: 'POST',
      url: `http://192.168.0.63:80/remote/opendoor`,
      json: true,
      body: {
        token: MD5(
          `remote${nowTime.format('YYYYMMDD')}010109${nowTime.format('HHmmss')}`
        ).toString(),
        room: '010109',
        time: nowTime.format(),
      },
    });
  } catch (err) {
    console.log(err);
  }
  res.send(`open door success`);
});

app.get('/api/token', async (req, res) => {
  let token = null;

  try {
    token = await getTonnetServiceToken();
    console.log(token);
  } catch (err) {
    console.log(err);
  }
  res.send(`get token-${token}`);
});

app.post('/tonnetTest', (req, res) => {
  console.log('接受通航外拋事件');
  console.log(req.body);
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
