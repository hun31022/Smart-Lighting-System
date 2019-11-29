# 시나리오

- ## Light Controller – Main Controller – IoE 서버 간 통신 확인
1. ### 방 및 Light 등록 및 처리/DB 확인
    - 등기구 연결 후 등 이름 등록 화면
      - 거실에 있는 등을 시스템에 연결하면 주어진 프로토콜에 따라 등 등록이 이루어지고 DB에 해당 등 정보가 저장됨
      - 등을 웹 서비스 또는 음성 인식 기반으로 사용하기 위해서는 이름과 방 정보가 등록되어야 하며, 주어지지 않은 등은 웹 관리 페이지에서 “Unregistered Light”로 표시됨
      
        *<Unregistered Light 표시 화면>*
        ![Unregistered Light](https://user-images.githubusercontent.com/58102072/69791850-b1306a80-1208-11ea-9696-0c4efac123b0.PNG)
        (“Unregistered Light”를 선택하면 해당 등의 이름과 방 위치를 등록할 수 있으며 이로써 등 등록이 완료됨)
        
        *<등 이름 등록 화면>*
        ![Light Enrollment](https://user-images.githubusercontent.com/58102072/69792082-33b92a00-1209-11ea-8678-d136ce178e3d.PNG)
        
        <br/>
        <br/>
        
        - 등 등록 완료 후 확인 화면
          - 등이 등록되면 해당 등을 관리 페이지에서 확인할 수 있고 등을 제어할 수 있음
          
          *<등 등록 후 확인 화면>*
          ![Light Enrollment2](https://user-images.githubusercontent.com/58102072/69792196-84c91e00-1209-11ea-8b96-76ecf00fa05d.PNG)
        
        <br/>
        <br/>
        
        - 등 등록 완료 후 DB 내용
          - 등 등록이 완료되면 해당 등의 전체 정보가 DB에 업데이트됨
          
          *<등 등록 완료 후 DB 내용>*
          ![Light Enrollment ater DB](https://user-images.githubusercontent.com/58102072/69792641-56980e00-120a-11ea-8846-f01ce8ba459a.PNG)
        
        <br/>
        <br/>
        
        - 테스트베드 환경에 따라 모든 등 등록
        
          *<등록된 방 정보 화면>*<br/>
          ![Registered Room Information](https://user-images.githubusercontent.com/58102072/69793067-1edd9600-120b-11ea-8252-9a654888d744.PNG)
          
          *<각 방의 등 정보 화면>*
          ![Registered Room Information2](https://user-images.githubusercontent.com/58102072/69793177-47fe2680-120b-11ea-8c01-0f2a8f06fcea.PNG)
        
        
2. ### Web 서버를 통한 기본 제어 확인
    - 웹 관리 서비스를 통해 등 색깔 제어
    
      *<거실 큰 등 빨간 색 제어 및 결과 확인>*
      ![result confirm](https://user-images.githubusercontent.com/58102072/69793510-eee2c280-120b-11ea-9c40-0103f1441b96.PNG)
    
    - 웹 관리 서비스를 통해 등 동작 모드 변경 가능
      - 등 동작 모드는 음성제어 모드(Voice Mode) 및 스마트 모드(센서모드, AI모드)가 있으며 등 제어 화면에서 조작 가능
      - 음성제어 모드 및 스마트 모드 해제 수행
      
        *<거실 큰 등 음성제어 모드 및 스마트 모드 해제 화면>*
        ![mode](https://user-images.githubusercontent.com/58102072/69793623-2ea9aa00-120c-11ea-9e04-121d5b74a630.PNG)
    
3. ### 세션/연결 관리 확인
    - 세션/연결 관리 확인
      - 세션 일시 해제
        - 네트워크 문제 등으로 등과 메인 컨트롤러 간 핸즈쉐이킹에 문제가 생기면 웹소켓 연결이 종료됨
        - 웹소켓 연결이 종료되면 해당 등 DB의 device_state가 off로 변경되며 웹 관리화면에서 등 색이 흰색으로 변경됨
        
          *<세션 연결이 일시 해제된 상태 화면>*
          ![session](https://user-images.githubusercontent.com/58102072/69793844-8ba56000-120c-11ea-9e40-ac1523c84d52.PNG)
          
    - 세션 재개
      - 해당 등의 Light Controller는 Main Controller와 웹 소켓 연결이 끊어진 것을 확인하면 Main Controller와 웹 소켓 재연결을 수행함(화면 캡처 생략)
          

- ## 외부 사물 등록 및 관리
1. ### 차량 센서 사물 등록
    - 차량 센서 연결
      - 차량 센서를 설치하면 차량 센서는 Main Controller에 접속하여 등록 과정 수행
      - 차량 센서 정보가 DB에 저장되면 웹 관리 페이지(대시보드)에서 미등록된 사물(Unregistered Thing)로 표시됨
      
        *<미등록된 외부 사물 표시 화면>*
        ![Unregistered 3rd](https://user-images.githubusercontent.com/58102072/69794103-079fa800-120d-11ea-83d0-bdaf8f8c286f.PNG)
        <br/>
        (“Unregistered Thing”을 선택하면 사물 등록 화면이 나오면 사물의 종류(자동차)와 이름(차량센서) 선택)
        <br/>
        <br/>
        
        *<차량 센서 등록 화면>*<br/>
        ![car sensor register](https://user-images.githubusercontent.com/58102072/69794391-84cb1d00-120d-11ea-9cef-e1bb5d2635d3.PNG)
        
        <br/>
        <br/>
        
      - 차량 센서가 등록되면 대쉬보드에서 차량 센서 연결 정보(연결됨) 및 차량 유무 정보(차량 있음) 확인 가능<br/><br/>
        *<차량 센서 정보 확인 화면>*<br/>
        ![car sensor information](https://user-images.githubusercontent.com/58102072/69794581-de334c00-120d-11ea-8bb1-28069e293935.PNG)
        
        

2. ### 차량 센서 IoE 서비스 객체 확인
    - 차량 센서를 IoE 서비스를 생성하는 화면에서 Device 객체로 사용할 수 있음<br/><br/>
      *<IoE 서비스 룰에서 차량 센서를 Device로 활용하는 예>*
      ![IoE service rules to car sensor](https://user-images.githubusercontent.com/58102072/69794985-9fea5c80-120e-11ea-8897-9181f8686c45.PNG)
      
      <br/>
      <br/>
      <br/>
    

- ## 외부 서비스 관리
1. ### 날씨 정보 서비스 IoE 서비스 객체 확인
    - 날씨 정보를 IoE 서비스 생성화면에서 Device 객체로 사용할 수 있음<br/><br/>
      *<IoE 서비스 룰에서 날씨 정보를 Device로 활용하는 예>*
      ![IoE service rules to weather](https://user-images.githubusercontent.com/58102072/69795401-7c73e180-120f-11ea-9450-6fbd5d7a3a0a.PNG)
      
2. ### 미세먼지 정보 서비스 IoE 서비스 객체 확인
    - 미세먼지 정보를 IoE 서비스 생성화면에서 Device 객체로 사용할 수 있음<br/><br/>
      *<IoE 서비스 룰에서 미세먼지 정보를 Device로 활용하는 예>*
      ![IoE service rules to dust information](https://user-images.githubusercontent.com/58102072/69795590-d5437a00-120f-11ea-8074-5079362a1909.PNG)

- ## IoE 서비스 관리 및 처리
1. IoE 서비스 1: 차량 센서 기반 특정 등 켜기
    - IoE 서비스 룰 생성 – 룰 이름 및 설명 넣기<br/><br/>
      *<차량센서 기반 IoE 서비스 생성 1: 룰 추가>*
      ![car sensor rules1](https://user-images.githubusercontent.com/58102072/69796330-2bfd8380-1211-11ea-934c-9a2615aec103.PNG)
      
    - 룰 조건 추가 – 차량 센서 검출 값이 ON 이면<br/><br/>
      *<차량센서 기반 IoE 서비스 생성 2: 조건 추가>*
      ![car sensor rules2](https://user-images.githubusercontent.com/58102072/69796412-5a7b5e80-1211-11ea-9af6-5f1f7e90aee6.PNG)
      
    - 룰 액션 추가 – 거실 큰 등을 적색으로 켬<br/><br/>
      *<차량센서 기반 IoE 서비스 생성 3: 액션 추가>*
      ![car sensor rules3](https://user-images.githubusercontent.com/58102072/69796571-9adadc80-1211-11ea-8ae3-a8d8be8c721c.PNG)
    
    - IoE 서비스 룰 완성<br/><br/>
      *<차량센서 기반 IoE 서비스 생성 4: 룰 완성>*
      ![car sensor to IoE service rule2](https://user-images.githubusercontent.com/58102072/69857238-d689ab00-12d2-11ea-9c01-2185fa34969f.PNG)

      
2. IoE 서비스 2: 당일 날씨(비) 예보 시 아침 7시에 무드 등 노란 색 켜기
    - IoE 서비스 룰 생성 – 룰 이름 및 설명 넣기<br/><br/>
      *<날씨 정보 기반 IoE 서비스 생성 1: 룰 추가>*
      ![Weather IoE service rules1](https://user-images.githubusercontent.com/58102072/69857502-72b3b200-12d3-11ea-94df-179f408b598e.PNG)
      
    - 룰 조건 추가(Constraint) – 오늘 날씨 값이 ‘비’이면<br/><br/>
      *<날씨 정보 기반 IoE 서비스 생성 2: 조건 추가1>*
      ![Weather IoE service rules2](https://user-images.githubusercontent.com/58102072/69857658-bad2d480-12d3-11ea-99d7-5437c8ebf2c8.PNG)
      
    - 룰 조건 추가(Clock) – 시간 오전 7시, 매일 반복<br/><br/>
      *<날씨 정보 기반 IoE 서비스 생성 2: 조건 추가2>*
      ![Weather IoE service rules3](https://user-images.githubusercontent.com/58102072/69857790-fc637f80-12d3-11ea-92bb-7c64e1f6995e.PNG)
      
    - 룰 액션 추가 – 거실 무드 등을 노란색으로 켬<br/><br/>
      *<날씨 정보 기반 IoE 서비스 생성 3: 액션 추가>*<br/>
      ![Weather IoE service rules4](https://user-images.githubusercontent.com/58102072/69857936-4d737380-12d4-11ea-8611-ccc290dffbb2.PNG)
      
    - IoE 서비스 룰 완성<br/><br/>
      *<날씨 정보 기반 IoE 서비스 생성 4: 룰 완성>*
      ![Weather IoE service rules5](https://user-images.githubusercontent.com/58102072/69858024-7a278b00-12d4-11ea-8dd8-0547670d87b8.PNG)
      
    
3. IoE 서비스 3: 내일 미세먼지 나쁨 예보 시 저녁 10시에 무드 등 파란 색 켜기
    - IoE 서비스 룰 생성 – 룰 이름 및 설명 넣기<br/><br/>
      *<미세먼지 정보 기반 IoE 서비스 생성 1: 룰 추가>*
      ![dust IoE service rules1](https://user-images.githubusercontent.com/58102072/69858188-d4285080-12d4-11ea-9170-75cce14a4593.PNG)
      
    - 룰 조건 추가(Constraint) – 내일 미세먼지 값이 ‘나쁨’이면<br/><br/>
      *<미세먼지 정보 기반 IoE 서비스 생성 2: 조건 추가1>*
      ![dust IoE service rules2](https://user-images.githubusercontent.com/58102072/69858313-16519200-12d5-11ea-9e7c-f89e5f15934c.PNG)
      
    - 룰 조건 추가(Clock) – 시간 저녁 10시, 반복 없음<br/><br/>
      *<미세먼지 정보 기반 IoE 서비스 생성 2: 조건 추가2>*
      ![dust IoE service rules3](https://user-images.githubusercontent.com/58102072/69858416-4bf67b00-12d5-11ea-85c9-8775e7238da7.PNG)
      
    - 룰 액션 추가 – 거실 무드 등을 파란색으로 켬<br/><br/>
      *<미세먼지 정보 기반 IoE 서비스 생성 3: 액션 추가>*<br/>
      ![dust IoE service rules4](https://user-images.githubusercontent.com/58102072/69858497-7b0cec80-12d5-11ea-98eb-949773609584.PNG)
      
    - IoE 서비스 룰 완성<br/><br/>
      *<미세먼지 정보 기반 IoE 서비스 생성 4: 룰 완성>*
      ![dust IoE service rules5](https://user-images.githubusercontent.com/58102072/69858567-a5f74080-12d5-11ea-9174-e4a7a5721712.PNG)
      
    - 생성된 IoE 서비스 룰 확인<br/><br/>
      *<생성된 IoE 서비스 룰 확인(룰 테이블)>*
      ![dust IoE service rules6](https://user-images.githubusercontent.com/58102072/69858648-c626ff80-12d5-11ea-9cd8-ee662292dac7.PNG)
      

