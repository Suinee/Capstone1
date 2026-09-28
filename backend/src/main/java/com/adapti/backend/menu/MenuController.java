package com.adapti.backend.menu;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {

    private final MenuRepository menuRepository;

    public MenuController(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    // 전체 활성 메뉴 조회
    @GetMapping
    public List<Menu> getMenus() {
        return menuRepository.findByIsActiveTrue();
    }

    // 카테고리별 메뉴 조회
    @GetMapping("/category/{category}")
    public List<Menu> getMenusByCategory(
            @PathVariable String category) {

        return menuRepository
                .findByCategoryAndIsActiveTrue(category);
    }

    // 메뉴 추가
    @PostMapping
    public Menu addMenu(@RequestBody Menu menu) {
        return menuRepository.save(menu);
    }
}