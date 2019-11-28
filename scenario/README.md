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
        
          *<등록된 방 정보 화면>*
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
        
2. ### 차량 센서 IoE 서비스 객체 확인

- ## 외부 서비스 관리
1. 날씨 정보 서비스 IoE 서비스 객체 확인
2. 미세먼지 정보 서비스 IoE 서비스 객체 확인

- ## IoE 서비스 관리 및 처리
1. IoE 서비스 1: 차량 센서 기반 특정 등 켜기
2. IoE 서비스 2: 당일 날씨(비) 예보 시 아침 7시에 무드 등 노란 색 켜기
3. IoE 서비스 3: 내일 미세먼지 나쁨 예보 시 저녁 10시에 무드 등 파란 색 켜기

