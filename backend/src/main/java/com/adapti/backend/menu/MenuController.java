package com.adapti.backend.menu;

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

    // 메뉴 수정
    @PutMapping("/{id}")
    public Menu updateMenu(
            @PathVariable Long id,
            @RequestBody Menu updatedMenu
    ) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("메뉴를 찾을 수 없습니다.")
                );

        // 가격
        if (updatedMenu.getPrice() != null) {
            menu.setPrice(updatedMenu.getPrice());
        }

        // 재고
        if (updatedMenu.getStockQuantity() != null) {
            menu.setStockQuantity(updatedMenu.getStockQuantity());
        }

        // 버거인 경우 영양정보
        if ("BURGER".equals(menu.getCategory())) {
            menu.setCalories(updatedMenu.getCalories());
            menu.setCarbohydrate(updatedMenu.getCarbohydrate());
            menu.setProtein(updatedMenu.getProtein());
            menu.setFat(updatedMenu.getFat());
            menu.setSodium(updatedMenu.getSodium());
        }

        return menuRepository.save(menu);
    }
}