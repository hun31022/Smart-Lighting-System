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
        
        
        
        
        
        
2. Web 서버를 통한 기본 제어 확인
3. 세션/연결 관리 확인

- ## 외부 사물 등록 및 관리
1. 차량 센서 사물 등록
2. 차량 센서 IoE 서비스 객체 확인

- ## 외부 서비스 관리
1. 날씨 정보 서비스 IoE 서비스 객체 확인
2. 미세먼지 정보 서비스 IoE 서비스 객체 확인

- ## IoE 서비스 관리 및 처리
1. IoE 서비스 1: 차량 센서 기반 특정 등 켜기
2. IoE 서비스 2: 당일 날씨(비) 예보 시 아침 7시에 무드 등 노란 색 켜기
3. IoE 서비스 3: 내일 미세먼지 나쁨 예보 시 저녁 10시에 무드 등 파란 색 켜기

