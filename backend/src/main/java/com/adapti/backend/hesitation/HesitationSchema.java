package com.adapti.backend.hesitation;

import javax.sql.DataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/** 기존 메뉴 데이터는 변경하지 않고 로그 테이블만 준비한다. */
@Component
public class HesitationSchema {
    public HesitationSchema(DataSource dataSource) {
        new ResourceDatabasePopulator(new ClassPathResource("db/hesitation.sql"))
                .execute(dataSource);
    }
}
