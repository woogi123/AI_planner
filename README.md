# ✈️ AI 여행 플래너
AI와 함께하는 똑똑한 여행 일정 관리 서비스

---

## 📌 1. 프로젝트 개요
AI 여행 플래너는 사용자가 AI 추천을 통해 여행 일정을 손쉽게 생성하고 관리할 수 있도록 돕는 웹 기반 일정 관리 서비스입니다.
캘린더 기반 UI를 활용하여 직관적인 일정 관리가 가능하며, 로그인 없이 게스트 사용자도 임시 키로 일정을 생성/관리할 수 있습니다.

---

## 🚀 2. 주요 기능

<details> <summary><strong>📄 접기/펼치기</strong></summary>

### ✅ AI 기반 일정 추천
* AI가 날짜에 맞는 여행지 및 활동을 추천
* 채팅 기반 인터페이스 제공
* 채팅 내용과 추천 일정은 상세 정보로 저장

### ✅ 일정 생성 / 조회 / 수정 / 삭제 기능
* 일정 생성: AI 추천을 통해 새 일정 생성 가능 (회원/비회원)
* 일정 조회: 캘린더에서 일정 클릭 시 상세 정보 확인 가능 (회원)
* 일정 수정: 등록된 일정의 제목, 시간, 메모 등 수정 가능 (회원)
* 일정 삭제: 사용자가 기존 일정을 삭제할 수 있음 (회원)

### ✅ 인증 및 권한
* JWT 기반 인증 시스템
* 일반 사용자(USER) / 게스트 사용자(GUEST)

### ✅ 일정 내보내기 
* JPG 또는 PDF 형식으로 일정 내보내기 가능

</details>

---

## 🛠️ 3. 기술 스택

<details> <summary><strong>📄 접기/펼치기</strong></summary>

🔹 Back-End / 항목 내용

* 언어	Java 17
* 프레임워크 Spring Boot 3.x
* ORM Spring Data JPA
* 보안 Spring Security + JWT
* API 통신 RestTemplate
* 빌드 도구 Maven
* DB MySQL (MariaDB)
* 캐시 Redis
* 환경 변수 dotenv (.env 파일 사용)

🔹 DevOps / 협업 도구
* 형상 관리: GitHub
* 문서화: Notion, Google Docs
* API 테스트: Postman
* 컨테이너: Docker, Kubernetes
* 모니터링: Redis
* AI 도구 참고: ChatGPT, Deepseek, Google Gemini

</details> 

---

## 🧾 4. 백엔드 실행 방법

### ✅ 4.1. MYSQL 설정

<details> <summary><strong>📄 접기/펼치기</strong></summary>

#1. mariaDB 접속
* mysql-u root -p

#2. 비번 입력 후 데이터베이스 보기
* MariaDB [(none)]> show databases;

#3. 목록에 mysql이 있다면 선택
* MariaDB [(none)]> use mysql;

#4. planner_db 생성 및 설정
* MariaDB [(mysql)]CREATE DATABASE planner_db;
* MariaDB [(mysql)]CREATE USER 'planner'@'%' IDENTIFIED BY 'planner';
* MariaDB [(mysql)]GRANT ALL PRIVILEGES ON planner_db.* TO 'planner'@'%';
* MariaDB [(mysql)]FLUSH PRIVILEGES;
* MariaDB [(mysql)]EXIT;

#5. planner_db 사용자 계정 접속

* mysql -u root -p
* use planner_db 입력
* MariaDB [(mysql)] use planner_db;

</details>


### ✅ 4.2. application.yml 설정

<details> <summary><strong>📄 접기/펼치기</strong></summary>

* spring:
  * datasource:
    * url: jdbc:mariadb://localhost:3306/planner_db
    * username: {사용자이름}         # 예: planner
    * password: {비밀번호}           # 예: planner123
* jpa:
    * hibernate:
      * ddl-auto: update             # 개발 시에는 'update', 운영 시에는 'none' 권장
    * show-sql: true                 # 콘솔에 SQL 쿼리 출력
</details>

----

## 🗂️ 5. 백엔드 프로젝트 구조

<details> <summary><strong>📄 접기/펼치기</strong></summary>

```
SK_3team.example.planner/
├── config/                    # 애플리케이션 전역 설정
│   ├── RedisConfig.java
│   └── SecurityConfig.java
├── controller/                # REST API 엔드포인트
│   ├── PlanController.java
│   └── UserController.java
├── dto/                       # DTO (데이터 전송 객체)
│   ├── CustomUserDetails.java
│   ├── ErrorResponseDto.java
│   ├── PlanDetailResponseDto.java
│   ├── PlanRequestDto.java
│   ├── PlanResponseDto.java
│   └── UserDTO.java
├── entity/                    # JPA 엔티티
│   ├── Plan.java
│   ├── PlanDetail.java
│   └── UserEntity.java
├── exception/                 # 예외 처리
│   ├── advice/
│   ├── AuthException.java
│   ├── GlobalExceptionHandler.java
│   ├── PlanNotFoundException.java
│   └── ResourceNotFoundException.java
├── jwt/                       # JWT 필터 및 유틸
│   ├── JWTFilter.java
│   ├── JWTUtil.java
│   ├── LoginCheckFilter.java
│   └── LoginFilter.java
├── redis/
│   └── RedisUtil.java
├── repository/                # JPA 레포지토리
│   ├── PlanRepository.java
│   └── UserRepository.java
├── service/                   # 서비스 레이어
│   ├── CustomUserDetailsService.java
│   ├── PlanService.java
│   └── UserService.java
├── PlannerApplication.java    # 스프링 부트 메인 클래스


```
</details>


