package hr.abysalto.hiring.mid.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.relational.core.mapping.NamingStrategy;
import org.springframework.data.relational.core.mapping.RelationalPersistentProperty;

@Configuration
public class JdbcConfig {

    @Bean
    public NamingStrategy namingStrategy() {
        return new NamingStrategy() {

            @Override
            public String getColumnName(RelationalPersistentProperty property) {
                return toSnakeCase(property.getName()).toUpperCase();
            }

            private String toSnakeCase(String name) {
                StringBuilder result = new StringBuilder();
                for (int i = 0; i < name.length(); i++) {
                    char c = name.charAt(i);
                    if (Character.isUpperCase(c) && i > 0) {
                        result.append('_');
                    }
                    result.append(Character.toLowerCase(c));
                }
                return result.toString();
            }
        };
    }
}
