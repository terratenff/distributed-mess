package org.tt.field.controllers.front;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/admin")
public class GeneralController {

    private static Logger logger = LoggerFactory.getLogger(GeneralController.class);

    private final String HOME = "";
    private final String MISSION_CONTROL = "/mission_control";
    private final String RESOURCES = "/resources";
    private final String INBOUND_SHIPS = "/inbound_ships";
    private final String OUTBOUND_SHIPS = "/outbound_ships";
    private final String ACTIVE_SHIPS = "/active_ships";

    @GetMapping(HOME)
    public ModelAndView index(final HttpServletRequest request) {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "index");

        return mav;
    }

    @GetMapping(MISSION_CONTROL)
    public ModelAndView missionControl(final HttpServletRequest request) {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "mission_control");

        return mav;
    }

    @GetMapping(RESOURCES)
    public ModelAndView resources(final HttpServletRequest request) {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "resources");

        return mav;
    }

    @GetMapping(INBOUND_SHIPS)
    public ModelAndView inboundShips(final HttpServletRequest request) {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "inbound_ships");

        return mav;
    }

    @GetMapping(OUTBOUND_SHIPS)
    public ModelAndView outboundShips(final HttpServletRequest request) {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "outbound_ships");

        return mav;
    }

    @GetMapping(ACTIVE_SHIPS)
    public ModelAndView activeShips(final HttpServletRequest request) {
        ModelAndView mav = new ModelAndView();
        mav.setViewName("base");
        mav.addObject("pageContext", "active_ships");

        return mav;
    }
}
